/**
 * @fileOverview Encapsulates data and logic for 2d points.
 * @author <a href="benjaminbojko.com">Benjamin Bojko</a>
 * Copyright (c) 2014 Big Spaceship; Licensed MIT
 */

'use strict';

/**
 * @constructor
 * @param {number=} x
 * @param {number=} y
 */
exports.Point = function(x, y) {
  /** @type {number} */
  this.x = x || 0;
  /** @type {number} */
  this.y = y || 0;
};

/**
 * A point representing the x and y distance to a point <code>p</code>
 * @param {exports.Point} p
 * @return {exports.Point} A new instance of exports.Point
 */
exports.Point.prototype.delta = function(p) {
  return new exports.Point(p.x - this.x, p.y - this.y);
};
