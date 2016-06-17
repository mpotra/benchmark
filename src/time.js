var nextTick;
var initTimer;
var getTimer;

/*******************************************************************************
 * nextTick
 ******************************************************************************/
nextTick = (fn, ...args) => setTimeout(() => fn(...args), 0);

// Node.JS implementation.
if (typeof process === 'object' && process !== null &&
    typeof process.nextTick === 'function') {
  
  nextTick = (fn, ...args) => process.nextTick(() => fn(...args));
}

export {nextTick};

/*******************************************************************************
 * Timer functions: initTimer and getTimer
 * Always return miliseconds.
 * Nanoseconds are expressed as floats in the returned value, which makes
 * the functions compatible with systems that do not support any high resolution
 * timers.
 ******************************************************************************/

initTimer = () => Date.now();
getTimer = (start = NaN) => Date.now() - start;

// Node.JS implementation.
if (typeof process === 'object' && process !== null &&
    typeof process.hrtime === 'function') {
    
  initTimer = () => process.hrtime();
  getTimer = (start) => {
    const end = process.hrtime(start);
    return (end[0] * 1e9 + end[1]) / 1e6;
  };
  
} else if (typeof performance === 'object' && performance !== null &&
            typeof performance.now === 'function') {
  // High-resolution time for browsers.
  initTimer = () => performance.now();
  getTimer = (start) => {
    return performance.now() - start;
  };
}

export {initTimer, getTimer};
