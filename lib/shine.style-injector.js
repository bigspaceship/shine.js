/**
 * @fileOverview Singleton that injects CSS rules into the document header.
 * @author <a href="benjaminbojko.com">Benjamin Bojko</a>
 * Copyright (c) 2014 Big Spaceship; Licensed MIT
 */
'use strict';

/**
 * @constructor
 */
exports.StyleInjector = function() {
  this.injections = {};
};

/**
 * @type {?exports.StyleInjector}
 */
exports.StyleInjector.instance_ = null;

/**
 * Singleton
 *
 * @return {exports.StyleInjector}
 */
exports.StyleInjector.getInstance = function() {
  if (!exports.StyleInjector.instance_) {
    exports.StyleInjector.instance_ = new exports.StyleInjector();
  }
  return exports.StyleInjector.instance_;
};

/**
 * Injects css as a style node to the header.
 *
 * @param {string} css
 * @param {HTMLDocument=} doc The document. Defaults to window.document
 * @return {HTMLStyleElement} The created style node.
 */
exports.StyleInjector.prototype.inject = function(css, doc) {
  doc = doc || window.document;

  // don't inject twice
  if (this.injections[css] === doc) {
    return;
  }

  /**
   * @type {HTMLStyleElement}
   */
  var domElement = document.createElement('style');
  domElement.type = 'text/css';
  domElement.innerHTML = css;

  var firstChild = doc.getElementsByTagName('head')[0].firstChild;
  doc.getElementsByTagName('head')[0].insertBefore(domElement, firstChild);

  this.injections[css] = doc;

  return domElement;
};
