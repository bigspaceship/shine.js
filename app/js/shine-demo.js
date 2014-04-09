/* global shinejs, dat */

'use strict';

function ShineDemo() {
  this.config = new shinejs.Config();
  this.colors = {
    text: '#f7f7f7',
    shadow: '#000',
    background: '#fff'
  };

  this.gui = null;
  this.shines = null;
  this.lightPosition = new shinejs.Point();
}

ShineDemo.prototype.init = function() {
  this.initGui();
  this.initShines();
  this.initExampleLinks();

  window.addEventListener('resize', this.draw.bind(this), false);
  window.addEventListener('scroll', this.draw.bind(this), false);

  if ('onorientationchange' in window) {
    window.addEventListener('deviceorientation', this.handleOrientationChange.bind(this), false);
  } else {
    window.addEventListener('mousemove', this.handleMouseMove.bind(this), false);
  }

  this.draw();
};

ShineDemo.prototype.initGui = function() {
  var fnDraw = this.draw.bind(this);
  var fnUpdateColor = this.handleColorUpdates.bind(this);

  this.gui = new dat.GUI();
  this.gui.remember(this.config);
  this.gui.remember(this.colors);

  var shadowFolder = this.gui.addFolder('Shadow');
  var colorFolder = this.gui.addFolder('Color');

  shadowFolder.add(this.config, 'numSteps').min(1).max(64).step(1).onChange(fnDraw);
  shadowFolder.add(this.config, 'opacity').min(0).max(1).step(0.025).onChange(fnDraw);
  shadowFolder.add(this.config, 'opacityPow').min(0).max(8).step(0.05).onChange(fnDraw);
  shadowFolder.add(this.config, 'offset').min(0).max(1).step(0.01).onChange(fnDraw);
  shadowFolder.add(this.config, 'offsetPow').min(0).max(4).step(0.05).onChange(fnDraw);
  shadowFolder.add(this.config, 'blur').min(0).max(128).step(1).onChange(fnDraw);
  shadowFolder.add(this.config, 'blurPow').min(0).max(4).step(0.05).onChange(fnDraw);

  colorFolder.addColor(this.colors, 'text').onChange(fnUpdateColor);
  colorFolder.addColor(this.colors, 'shadow').onChange(fnUpdateColor);
  colorFolder.addColor(this.colors, 'background').onChange(fnUpdateColor);

  shadowFolder.open();
  colorFolder.open();
  this.gui.close();
};

ShineDemo.prototype.initExampleLinks = function() {

};

ShineDemo.prototype.initShines = function() {
  this.destroyShines();
  this.shines = [];
  var shineElements = document.querySelectorAll('.shine');

  for (var i = 0; i < shineElements.length; i++) {
    var element = shineElements[i];
    var shine = new Shine(element, this.config);
    shine.light.position = this.lightPosition;
    shine.draw();
    this.shines.push(shine);
  }
};

ShineDemo.prototype.destroyShines = function() {
  if (!this.shines) {
    return;
  }

  for (var i = 0; i < this.shines.length; i++) {
    var shine = this.shines[i];
    shine.destroy();
  }

  this.shines = null;
};

ShineDemo.prototype.draw = function () {
  var top = 0;
  var bottom = window.innerHeight;

  for (var i = this.shines.length - 1; i >= 0; i--) {
    var shine = this.shines[i];
    var rect = shine.domElement.getBoundingClientRect();

    // only re-draw if shine is visible
    if (rect.bottom > top && rect.top < bottom) {
      this.shines[i].draw();
    }
  }
};

ShineDemo.prototype.handleMouseMove = function(event) {
  this.lightPosition.x = event.clientX;
  this.lightPosition.y = event.clientY;
  this.draw();
};

ShineDemo.prototype.handleOrientationChange = function(event) {
  var radiusX = window.innerWidth * 0.5;
  var radiusY = window.innerHeight * 0.5;

  var beta = - Math.PI * event.beta / 180;
  var gamma = - Math.PI * event.gamma / 180;

  var x = 2.0 * radiusX * Math.sin(gamma);
  var y = 2.0 * radiusY * Math.sin(beta);

  this.lightPosition.x = radiusX + x;
  this.lightPosition.y = radiusY + y;
  this.draw();
};

ShineDemo.prototype.handleColorUpdates = function(event) {
  this.config.shadowRGB = shinejs.Color.colorFromHex(this.colors.shadow);
  document.body.style.backgroundColor = this.colors.background;
  document.documentElement.style.backgroundColor = this.colors.background;

  var textColorElements = document.querySelectorAll('.shine-text-color');
  for (var i = textColorElements.length - 1; i >= 0; i--) {
    var element = textColorElements[i];
    var color = this.colors.text;

    if (element.className.indexOf('shine-text-color-dark') !== -1) {
      var rgb = shinejs.Color.colorFromHex(color);
      rgb.r *= 0.9;
      rgb.g *= 0.9;
      rgb.b *= 0.9;
      color = rgb.getRGBAString();
    }

    element.style.color = color;
  }

  this.draw();
};

ShineDemo.prototype.rgbFromHex = function(hex) {
  hex = hex.replace('#', '');
  var color = parseInt(hex, 16);
  return new shinejs.Color(
    (color >> 16) & 0xff,
    (color >> 8) & 0xff,
    color & 0xff
  );
};
ShineDemo.prototype.rgbaFromRgb = function(rgb) {
  return 'rgba(' +
    Math.round(rgb.r) + ',' +
    Math.round(rgb.g) + ',' +
    Math.round(rgb.b) + ',' +
  ' 1.0)';
};

