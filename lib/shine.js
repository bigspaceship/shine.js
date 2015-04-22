/**
 * @fileOverview Main shine.js file.
 * @author <a href="http://benjaminbojko.com">Benjamin Bojko</a>
 * Copyright (c) 2015 Big Spaceship; Licensed MIT
 */

'use strict';

/**
 * Creates a new Shine instance for one dom element.
 *
 * @constructor
 * @param {!HTMLElement} domElement The element to apply the shine effect to.
 *                                  This element may contain text content only
 *                                  and have no children.
 * @param {!Config} optConfig An optional Config instance.
 * @param {?string=} optClassPrefix An optional class-prefix applied to all
 *                                  injected styles. Defaults to 'shine-'.
 * @param {?string=} optShadowProperty Can be 'textShadow' or 'boxShadow'.
 *                                     Defaults to 'textShadow'.
 */
shinejs.Shine = function(domElement, optConfig, optClassPrefix, optShadowProperty) {
  if (!domElement) {
    throw new Error('No valid DOM element passed as first parameter');
  }

  this.light = new shinejs.Light();
  this.config = optConfig || new shinejs.Config();
  this.domElement = domElement;

  this.classPrefix = optClassPrefix || 'shine-';
  this.shadowProperty = optShadowProperty ||
    (this.elememtHasTextOnly(domElement) ? 'textShadow' : 'boxShadow');

  this.shadows = [];
  this.splitter = new shinejs.Splitter(domElement, this.classPrefix);

  this.areAutoUpdatesEnabled = true;

  this.fnDrawHandler = null;

  this.updateContent();
};

/**
 * Releases all resources and removes event listeners. Destroyed instances
 * can't be reused and must be discarded.
 */
shinejs.Shine.prototype.destroy = function() {
  this.disableAutoUpdates();

  for (var i = this.shadows.length - 1; i >= 0; i--) {
    this.shadows[i].destroy();
  }

  this.light = null;
  this.shadows = null;
  this.splitter = null;

  this.fnDrawHandler = null;
};

/**
 * Draws all shadows based on the current light position.
 */
shinejs.Shine.prototype.draw = function() {
  for (var i = this.shadows.length - 1; i >= 0; i--) {
    this.shadows[i].draw(this.light, this.config);
  }
};

/**
 * Recreates all required DOM elements and injects CSS. Called by constructor.
 *
 * Use this method to re-initialize the DOM element (e.g. when the contents
 * have changed) or to change the text.
 *
 * @param {?string=} optText Will set the text of the domElement. If optText is
 *                           not defined, the current textContent of domElement
 *                           will be used.
 */
shinejs.Shine.prototype.updateContent = function(optText) {
  var wereAutoUpdatesEnabled = this.areAutoUpdatesEnabled;
  this.disableAutoUpdates();

  shinejs.StyleInjector.getInstance().inject(this.getCSS());

  this.shadows.length = 0;

  this.splitter.split(optText, !optText && !this.elememtHasTextOnly(this.domElement));

  var shadowProperty = this.getPrefixed(this.shadowProperty);

  for (var j = 0; j < this.splitter.elements.length; j++) {
    var element = this.splitter.elements[j];
    var shadow = new shinejs.Shadow(element);
    shadow.shadowProperty = shadowProperty;
    this.shadows.push(shadow);
  }

  if (wereAutoUpdatesEnabled) {
    this.enableAutoUpdates();
  }
  this.draw();
};

/**
 * Adds DOM event listeners to automatically update all properties.
 */
shinejs.Shine.prototype.enableAutoUpdates = function() {
  this.disableAutoUpdates();
  this.areAutoUpdatesEnabled = true;

  // store reference fore more efficient minification
  var fnDrawHandler = this.fnDrawHandler = this.draw.bind(this);

  window.addEventListener('scroll', fnDrawHandler, false);
  window.addEventListener('resize', fnDrawHandler, false);

  for (var i = this.shadows.length - 1; i >= 0; i--) {
    var shadow = this.shadows[i];
    shadow.enableAutoUpdates();
  }
};
/**
 * Removes DOM event listeners to automatically update all properties.
 */
shinejs.Shine.prototype.disableAutoUpdates = function() {
  this.areAutoUpdatesEnabled = false;

  // store reference fore more efficient minification
  var fnDrawHandler = this.fnDrawHandler;

  if (!fnDrawHandler) {
    return;
  }

  this.fnDrawHandler = null;

  window.removeEventListener('scroll', fnDrawHandler, false);
  window.removeEventListener('resize', fnDrawHandler, false);

  for (var i = this.shadows.length - 1; i >= 0; i--) {
    var shadow = this.shadows[i];
    shadow.disableAutoUpdates();
  }
};

/**
 * The CSS to inject into the header.
 * @protected
 * @return {string}
 */
shinejs.Shine.prototype.getCSS = function() {
  return '/* shine.js styles */' +
    '.shine-wrapper {' +
    ' display: inline-block;' +
    ' position: relative;' +
    ' max-width: 100%;' +
    '}' +
    '' +
    '.shine-word {' +
    ' display: inline-block;' +
    ' white-space: nowrap;' +
    '}' +
    '' +
    '.shine-letter {' +
    ' position: relative;' +
    ' display: inline-block;' +
    '}' +
    '' +
    '.shine-mask {' +
    ' position: absolute;' +
    ' top: 0;' +
    ' left: 0;' +
    ' right: 0;' +
    ' bottom: 0;' +
    '}';
};

/**
 * Prefixes a CSS property.
 * @protected
 * @param {string} property The css property to prefix.
 * @return {string}
 */
shinejs.Shine.prototype.getPrefixed = function(property) {
  var element = this.domElement || document.createElement('div');
  var style = element.style;

  // bb: prioritize prefixed properties over non-prefixed to prevent usage
  // of placeholders (e.g. 'filter' in webkit is defined but does nothing)
  var prefixes = ['webkit', 'ms', 'Moz', 'Webkit', 'O'];
  var suffix = property.charAt(0).toUpperCase() + property.substring(1);

  for (var i = 0; i < prefixes.length; i++) {
    var prefixed = prefixes[i] + suffix;
    if (prefixed in style) {
      return prefixed;
    }
  }

  return property;
};

/**
 * Checks if a CSS property is supported in the current browser. Tests available
 * prefixes automatically.
 *
 * Example: <code>isCSSPropertySupported('filter', 'blur(2px)')</code>.
 *
 * @protected
 * @param {string} property The css property to test against.
 * @param {string} testValue The css property to test against.
 * @return {boolean}
 */
shinejs.Shine.prototype.isCSSPropertySupported = function(property, testValue) {
  var element = document.createElement('div');
  var style = element.style;
  var prefixes = ['-webkit-', '-ms-', '-moz-'];
  style.cssText = prefixes.join(property + ':' + testValue + ';');
  return !!style.length && ((document.documentMode === undefined || document.documentMode > 9));
};

/**
 * Checks if CSS filters (e.g. drop-shadow/blur) are supported.
 * @return {boolean}
 */
shinejs.Shine.prototype.areFiltersSupported = function() {
  return this.isCSSPropertySupported('filter', 'blur(2px)');
};

/**
 * Checks whether a DOM element only contains childNodes of type TEXT_NODE (3).
 * @protected
 * @param {HTMLElement} domElement
 * @return {boolean}
 */
shinejs.Shine.prototype.elememtHasTextOnly = function(domElement) {
  var childNodes = domElement.childNodes;

  if (!childNodes || childNodes.length === 0) {
    return true;
  }

  for (var i = 0; i < childNodes.length; i++) {
    if (childNodes[i].nodeType !== 3) {
      return false;
    }
  }

  return true;
};

/**
 * @const
 * @type {shinejs.Shine}
 */
shinejsGlobal.Shine = shinejsGlobal.Shine || shinejs.Shine;
