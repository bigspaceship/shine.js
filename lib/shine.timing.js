/**
 * @fileOverview Basic timing functions like throttle and debounce.
 * @author <a href="benjaminbojko.com">Benjamin Bojko</a>
 * Copyright (c) 2014 Big Spaceship; Licensed MIT
 */

'use strict';

shinejs.Timing = function() {

};

/**
 * Debounces a function to only be called once with a minimum delay
 * of <code>delay</code>ms.
 *
 * Loosely based on http://remysharp.com/2010/07/21/throttling-function-calls/
 *
 * @param {Function} fnCallback The callback function
 * @param {number} delay The delay in ms. Defaults to 0.
 * @param {*} context The context to which to apply the function on.
 *                    Defaults to this.
 * @return {Function} The debounced function.
 */
shinejs.Timing.debounce = function(fnCallback, delay, context) {

  var timeoutId = NaN;

  return function() {
    delay = delay || 0;
    context = context || this;
    var currentArguments = arguments;

    if (!isNaN(timeoutId)) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(function() {
      fnCallback.apply(context, currentArguments);
    }, delay);
  };
};


/**
 * Throttles a function to only be called with a delay of <code>delay</code>ms.
 *
 * Will always execute the first time immediately.
 *
 * Loosely based on http://remysharp.com/2010/07/21/throttling-function-calls/
 *
 * @param {Function} fnCallback The callback function
 * @param {number} delay The delay in ms. Defaults to 0.
 * @param {*} context The context to which to apply the function on.
 *                    Defaults to this.
 * @return {Function} The throttled function.
 */
shinejs.Timing.throttle = function(fnCallback, delay, context) {

  var previousTimestamp = NaN;
  var timeoutId = NaN;

  return function() {
    delay = delay || 0;
    context = context || this;

    // requires performance.now() polyfill
    var currentTimestamp = window.performance.now();
    var currentArguments = arguments;

    if (!isNaN(previousTimestamp) && currentTimestamp < previousTimestamp +
      delay) {
      // clear if we haven't waited long enough
      if (!isNaN(timeoutId)) {
        clearTimeout(timeoutId);
      }

      // delay execution by delay ms
      timeoutId = setTimeout(function() {
        previousTimestamp = currentTimestamp;
        fnCallback.apply(context, currentArguments);
      }, delay);
    } else {
      if (!isNaN(timeoutId)) {
        clearTimeout(timeoutId);
      }
      previousTimestamp = currentTimestamp;
      fnCallback.apply(context, currentArguments);
    }
  };
};
