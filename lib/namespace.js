'use strict';

/* jshint ignore:start */
var shinejs;
var shinejsGlobal;

// Wrap assigments in try/catch to support running unminified code
try {
  shinejs = shinejs || exports || {};
} catch(error) {
  shinejs = {};
}
try {
  shinejsGlobal = shinejsGlobal || global || {};
} catch(error) {
  shinejsGlobal = {};
}
/* jshint ignore:end */
