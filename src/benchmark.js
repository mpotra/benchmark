import assert from 'assert';
import {nextTick, initTimer, getTimer} from './time';
import {computeStats} from './stats';
import {Promise} from 'bluebird';

const __TASKS = Symbol('tasks');
/*
function addTask(name, fn, {pName = '', defer = false, setup, teardown} = {}) {

}
*/
export default class Suite {
  constructor({hrtime = {initTimer, getTimer}} = {}) {
    this[__TASKS] = [];
    this.hrtime = hrtime;
  }
  
  __add(pName, pFn,
        {name = '', fn = undefined, defer = false, setup, teardown} = {}) {
    
    const __fn = pFn || fn;
    const __name = pName || name;
    
    assert(typeof __fn === 'function', 'Function expected');
    
    const task = {fn: __fn, name: __name, defer, setup, teardown};
    
    this[__TASKS].push(task);
    
    return this;
  }
  
  add(...args) {
    var name;
    var fn;
    var opts;
    
    if (args.length > 0) {
      if (typeof args[0] === 'function') {
        fn = args.shift();
      } else {
        name = args.shift();
        
        if (args.length > 0 && typeof args[0] === 'function') {
          fn = args.shift();
        }
      }
      
      opts = args.shift();
    }
    
    this.__add(name, fn, opts);
    
    return this;
  }
  
  run({async = false} = {}) {
    return new Promise((resolve, reject) =>
                        runTasks(this[__TASKS], resolve, reject));
  }
  
}

Suite.Suite = Suite;

function runTask(task) {

  const name = task.name;
  const fn = (typeof task.fn === 'function' ? task.fn : () => {});
  
  let timer;
  
  return new Promise(function(resolve, reject) {
    const maxTotalTime = 10000;
    let totalTime = 0;
    let duration;
    let taskOps;
    let opTime;
    
    function doRun(count = 1, maxTime, done, failed) {
     
      nextTick(function() {
        timer = initTimer();
        run(count, function(stats) {
          
          if (!stats) {
            return done(new RangeError('Empty stats'));
          }
          
          duration = getTimer(timer);
          totalTime += duration;
          //fnTime = stats.totalTime / stats.count;
          opTime = duration / stats.count;
          
          if (totalTime <= maxTotalTime - maxTime) {
            
            if (duration < maxTime) {
              taskOps = maxTime / opTime;
            } else {
              taskOps = duration / opTime;
            }
            
            //console.log('doRun:', name, stats, duration, taskOps, opTime);
            doRun(taskOps, maxTime + 500, done, failed);
            
          } else {
            done(stats);
          }
        }, failed);
      });
    }
    
    doRun(1, 1000, resolve, reject);
  });
  

  function run(count = 1, resolve, reject) {
    let promise = Promise.resolve({count, name});
    
    if (typeof task.setup === 'function') {
      promise = promise.then(task.setup);
    }
    
    promise = promise.then((setupResult) => runLoop(count, setupResult));
    
    if (typeof task.teardown === 'function') {
      promise = promise.then((v) => {
        const returns = () => v;
        return Promise.resolve(v).then(task.teardown).then(returns, returns);
      });
    }
    
    promise.then(resolve, reject);

    return promise;
  }

  function runLoop(count, setupResult) {
    // Allocate handlers and internals, before executing loop.
    count = Number.parseInt(count);
    let handlers = new Array(count);
    let times = new Array(count);
    let internals = new Array(count);
    let loop = new Array(count);

    const runner = new Promise((resolve, reject) => {
      let finished = 0;
      
      function next(callback) {
        if (finished === count) {
          handlers = null;
          internals = null;
          loop = null;
          //process.stdout.write('done\r\n');
          nextTick(callback);
        } else {
          //process.stdout.write('.');
          nextTick(() => loop[finished++](() => next(callback)));
        }
      }
      
      nextTick(function() {
        next(function() {
          times = times.filter((v) => v !== undefined);
          resolve(times);
        });
      });
    });

    for (let i = 0; i < count; i++) {
      // Set up utility functions.
      const internal = internals[i] = {index: i};

      internal.resolve = function() {
        // Get timer.
        const time = getTimer(this.timer);
        // Clear resolve/reject functions.
        this.resolve = this.reject = () => {};
        this.finished = true;
        this.waiting = false;
        
        times[this.index] = time;
        nextTick(this.callback);
      };
      
      internal.reject = function(err) {
        this.resolve = this.reject = () => {};
        this.finished = true;
        this.waiting = false;
        nextTick(this.callback);
      };
      
      internal.wait = function() {
        this.waiting = true;
      };
      
      internal.start = function() {
        this.timer = initTimer();
      };
      
      
      // Set up handler.
      const handler = handlers[i] = () => internal.resolve();
      handler.resolve = () => internal.resolve();
      handler.reject = (err) => internal.reject(err);
      handler.wait = () => internal.wait();
      handler.start = () => internal.start();
      
      // Set up loop entry.
      loop[i] = function(callback) {
        internals[i].callback = callback;
        handlers[i].start();
        
        const fnResult = fn(setupResult, handlers[i]);
        
        if (internals[i].finished !== true) {
          if (typeof fnResult === 'object' && fnResult !== null &&
              typeof fnResult.then === 'function') {
              
            fnResult.then(handlers[i].resolve, handlers[i].reject);
          } else if (internals[i].waiting !== true) {
            handlers[i].resolve();
          }
        } else {
          handlers[i].resolve();
        }
      };
      
      // End of allocation loop.
    }
    
    return runner.then(computeStats);
    // End of runLoop()
  }
}

function runTasks(tasks, resolve, reject) {
  tasks = tasks.slice(0);
  
  if (tasks.length > 0) {
    const task = tasks[0];
    tasks = tasks.slice(1);
    
    runTask(task).then((stats) => {
      const result = {stats, task};
      
      nextTick(() => {
        runTasks(tasks, (results) => {
          resolve([result].concat(results));
        }, reject);
      });
    })
    .catch(reject);
  } else {
    resolve([]);
  }
}
