import Suite from '../src/benchmark';

const suite = new Suite();

var str = 'asfakjsfakjfaksjfakjsf3i2f23ifj23f2kfn2kfn23f';
var z;

suite
.add('substr', (args, done) => {
  z = str.substr(0, 13);
  // Args is usually the argument passed by `setup()`.
  done();
})
.add('substring', (args, done) => {
  z = str.substring(0, 13);
  // Reject this test.
  // Since all will be rejected, no stats will be collected.
  done.reject();
})
.add('slice', (args, done) => {
  z = str.slice(0, 13);
  // Signal the suite that this run needs to wait for a resolve or reject.
  done.wait();
  
  // After 120ms, signal a `resolve` finish.
  setTimeout(done.resolve, 120);
})
.add('for loop', (args, done) => {
  z = '';
  // do something here that takes a lot of time.
  
  // Instruct the suite to start measuring only from now.
  // All time spent in the function before this line, will be discarded.
  // For async operations, make sure to use `done.wait()` first.
  done.start();
  for (var i = 0; i < 13; i++) {
    z += str[i];
  }
  // Using done.resolve is same as using done();
  done.resolve();
});

suite.run().then(
  (results) => {
    console.log('Results:');
    results.forEach(function({task, stats}) {
      console.log(task.name, stats);
    });
  },
  (e) => console.log('Error:', e)
);