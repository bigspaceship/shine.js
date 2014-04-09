/**
 * @fileOverview Encapsulates data for lights.
 * @author <a href="benjaminbojko.com">Benjamin Bojko</a>
 * Copyright (c) 2014 Big Spaceship; Licensed MIT
 */

'use strict';

/**
 * @constructor
 * @param {?exports.Point=} optPosition An optional position. Defaults to (0, 0).
 */
exports.Light = function Light(optPosition) {
  /**
   * @type {exports.Point}
   */
  this.position = optPosition || new exports.Point(0, 0);

  /**
   * @type {number}
   */
  this.intensity = 1.0;
};
