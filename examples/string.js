import Suite from '../src/benchmark';

const suite = new Suite();

var str = 'asfakjsfakjfaksjfakjsf3i2f23ifj23f2kfn2kfn23f';
var z;

suite
.add('substr', ({a}, done) => {
  z = str.substr(0, a);
}, {
  setup: function() {
    // do some setup here.
    return {a: 13};
  }
})
.add('substring', (a, done) => {
  // First argument will be a number, not an object.
  z = str.substring(0, a);
}, {
  setup: function() {
    // do some setup here.
    // Works with promises as well.
    // Note: we're passing a number here,
    // instead of an object.
    return Promise.resolve(13);
  }
})
.add('slice', (args, done) => {
  z = str.slice(0, 13);
})
.add('for loop', (args, done) => {
  z = '';
  for (var i = 0; i < 13; i++) {
    z += str[i];
  }
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
