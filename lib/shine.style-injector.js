/**
 * @fileOverview Singleton that injects CSS rules into the document header.
 * @author <a href="http://benjaminbojko.com">Benjamin Bojko</a>
 * Copyright (c) 2015 Big Spaceship; Licensed MIT
 */
'use strict';

/**
 * @constructor
 */
shinejs.StyleInjector = function() {
  this.injections = {};
};

/**
 * @type {?shinejs.StyleInjector}
 */
shinejs.StyleInjector.instance_ = null;

/**
 * Singleton
 *
 * @return {shinejs.StyleInjector}
 */
shinejs.StyleInjector.getInstance = function() {
  if (!shinejs.StyleInjector.instance_) {
    shinejs.StyleInjector.instance_ = new shinejs.StyleInjector();
  }
  return shinejs.StyleInjector.instance_;
};

/**
 * Injects css as a style node to the header.
 *
 * @param {string} css
 * @param {HTMLDocument=} doc The document. Defaults to window.document
 * @return {HTMLStyleElement} The created style node.
 */
shinejs.StyleInjector.prototype.inject = function(css, doc) {
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
