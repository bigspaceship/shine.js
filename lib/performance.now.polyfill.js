'use strict';

/**
 * window.performance.now() polyfill
 * @type {Object.<string, Function>}
 */
window.performance = window.performance || window.webkitPeformance || window.mozPeformance || {
  'now': function(){
    return new Date().getTime();
  }
};
