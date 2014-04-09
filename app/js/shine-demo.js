function ShineDemo() {
  this.config = new shinejs.ShadowConfig({
    stepSize: 8,
    maxSteps: 5,
    opacity: 0.15,
    opacityPow: 1.2,
    offset: 0.15,
    offsetPow: 1.8,
    blur: 0.1,
    blurPow: 1.4,
    maxBlurRadius: 64,
    shadowRGB: new shinejs.Color(0, 0, 0)
  });
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

  shadowFolder.add(this.config, 'stepSize').min(1).max(256).step(1).onChange(fnDraw);
  shadowFolder.add(this.config, 'maxSteps').min(1).max(64).step(1).onChange(fnDraw);
  shadowFolder.add(this.config, 'opacity').min(0).max(1).step(0.025).onChange(fnDraw);
  shadowFolder.add(this.config, 'opacityPow').min(0).max(8).step(0.05).onChange(fnDraw);
  shadowFolder.add(this.config, 'offset').min(0).max(1).step(0.01).onChange(fnDraw);
  shadowFolder.add(this.config, 'offsetPow').min(0).max(4).step(0.05).onChange(fnDraw);
  shadowFolder.add(this.config, 'blur').min(0).max(1).step(0.025).onChange(fnDraw);
  shadowFolder.add(this.config, 'blurPow').min(0).max(4).step(0.05).onChange(fnDraw);
  shadowFolder.add(this.config, 'maxBlurRadius').min(0).max(128).step(4).onChange(fnDraw);

  colorFolder.addColor(this.colors, 'text').onChange(fnUpdateColor);
  colorFolder.addColor(this.colors, 'shadow').onChange(fnUpdateColor);
  colorFolder.addColor(this.colors, 'background').onChange(fnUpdateColor);

  shadowFolder.open();
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
    var shine = shines[i];
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
  this.config.shadowRGB = this.rgbFromHex(this.colors.shadow);
  document.body.style.backgroundColor = this.colors.background;
  document.documentElement.style.backgroundColor = this.colors.background;

  for (var i = this.shines.length - 1; i >= 0; i--) {
    var shine = this.shines[i];
    shine.domElement.style.color = this.colors.text;
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

