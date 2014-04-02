/**
 * @fileOverview Encapsulates data for lights.
 * @author <a href="benjaminbojko.com">Benjamin Bojko</a>
 * Copyright (c) 2014 Big Spaceship; Licensed MIT
 */

'use strict';

/**
 * @constructor
 */
exports.Light = function Light() {
  /**
   * @type {exports.Point}
   */
  this.position = new exports.Point(0, 0);

  /**
   * @type {number}
   */
  this.intensity = 1.0;
};
