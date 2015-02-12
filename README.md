# shine.js

A library for pretty shadows.

See the working demo at [http://bigspaceship.github.io/shine.js/](http://bigspaceship.github.io/shine.js/).

## Get Started [![Inline docs](http://inch-ci.org/github/bigspaceship/shine.js.svg?branch=master)](http://inch-ci.org/github/bigspaceship/shine.js)

Install using bower: `bower install shine` or [download as zip](https://github.com/bigspaceship/shine.js/archive/master.zip) or [fork on GitHub](https://github.com/bigspaceship/shine.js).

Create a Shine.js instance for each DOM element you'd like to shine:

```javascript
var shine = new Shine(document.getElementById('my-shine-object'));
```

Change the light position and make sure to redraw:

```javascript
shine.light.position.x = window.innerWidth * 0.5;
shine.light.position.y = window.innerHeight * 0.5;
shine.draw(); // make sure to re-draw
```

## Configuration

Each shine instance has a property pointing to an instance of `shinejs.Config`. One config can be shared amongst multiple shine instances.

When a config value changes, `shine.draw()` needs to be called to re-draw with the new settings.

Change the shadow of a shine instance:

```javascript
shine.config.opacity = 0.1;
shine.config.blur = 0.2;
shine.draw(); // make sure to re-draw
```

Create a shared `shinejs.Config` instance:

```javascript
// all parameters are optional and can be changed later
var config = new shinejs.Config({
  numSteps: 4,
  opacity: 0.2,
  shadowRGB: new shinejs.Color(255, 0, 0)
});

// pass the config in the constructor
var shineA = new Shine(document.getElementById('my-shine-object-a'), config);
var shineB = new Shine(document.getElementById('my-shine-object-b'), config);

// or assign it to an instance later
var shineC = new Shine(document.getElementById('my-shine-object-c'));
shineC.config = config;
shineC.draw(); // make sure to re-draw

```

## Shine API

*Note: `Shine` is also mapped to `shinejs.Shine`. Use the long version if `Shine` is already defined.*

### Shine(domElement, optConfig, optClassPrefix, optShadowProperty)

The Shine constructor. Instantiate as `new Shine(...)` to create a new instance.

| Parameter | Type | Description
| --- | --- | ---
| **domElement** | `!HTMLElement` | The DOM element to apply the shine effect to.
| **optConfig** | `?shinejs.Config=` | Optional config instance. If no instance is passed it a new instance with default values will be stored in the `config` property.
| **optClassPrefix** | `?string=` | Optional class prefix that will be applied to all shine DOM elements. Defaults to `shine-`.
| **optShadowProperty** | `?string=` | Optional property name that the shadow will be applied to. Overrides the automatic detection for use of either `textShadow` or `boxShadow`. The value will be applied as `element.style[shadowProperty] = '...'` and automatically prefixed for legacy browsers (e.g. `MozBoxShadow`).

### Shine.prototype.draw()

Draws all shadows based on the current light position. Call this method whenever a shine parameter is changed.

### Shine.prototype.destroy()

Releases all resources and removes event listeners. Destroyed instance can't be reused and must be discarded.

### Shine.prototype.updateContent(optText)

Re-initializes all shadows. Use this when you want to change the text or the domElement's contents have changed.

| Parameter | Type | Description
| --- | --- | ---
| **optText** | `?string=` | If defined, will replace the DOM element's textContent. If omitted, the content will be read from the DOM element.

### Shine.prototype.enableAutoUpdates()

Adds DOM event listeners to automatically update all properties.

### Shine.prototype.disableAutoUpdates()

Removes DOM event listeners to automatically update all properties.

### Shine Properties

| Property | Type | Description
| --- | --- | ---
| **domElement** | `HTMLElement` | The DOM element to apply the shine effect to.
| **config** | `shinejs.Config` | Stores all config parameters.
| **light** | `shinejs.Light` | Stores the light position and intensity.

## shinejs.Config API

### shinejs.Config(optSettings)

The shine config constructor. Pass an optional settings object from which to read values.

| Parameter | Type | Description
| --- | --- | ---
| **optSettings** | `?Object=` | An optional object containing config parameters.

### shinejs.Config Properties

| Property | Type | Default | Description
| --- | --- | --- | ---
|**numSteps** | `number` | `8` | The number of steps drawn in each shadow
|**opacity** | `number` | `0.1` | The opacity of each shadow (range: 0...1)
|**opacityPow** | `number` | `1.2` | The exponent applied to each step's opacity (1.0 = linear opacity).
|**offset** | `number` | `0.15` | Larger offsets create longer shadows
|**offsetPow** | `number` | `1.8` | The exponent applied to each step's offset (1.0 = linear offset).
|**blur** | `number` | `40` | The strength of the shadow blur.
|**blurPow** | `number` | `1.4` | The exponent applied to each step's blur (1.0 = linear blur).
|**shadowRGB** | `shinejs.Color` | `new shinejs.Color(0, 0, 0)` | The shadow color in r, g, b (0...255)

## shinejs.Light API

### shinejs.Light(optPosition)

The light constructor. Pass an optional position to apply by default.

| Parameter | Type | Description
| --- | --- | ---
| **optPosition** | `?shinejs.Point=` | An position. Defaults to `new shinejs.Point(0, 0)`.

### shinejs.Light Properties

| Property | Type | Default | Description
| --- | --- | --- | ---
|**position** | `shinejs.Point` | `new shinejs.Point(0, 0)` | The position of this light.
|**intensity** | `number` | `1.0` | The intensity of this light. Gets multiplied with shadow opacity.

## shinejs.Point API

### shinejs.Point(x, y)

A 2D point class.

| Parameter | Type | Description
| --- | --- | ---
| **x** | `number=` | The x-coordinate. Defaults to `0`.
| **y** | `number=` | The y-coordinate. Defaults to `0`.

### shinejs.Point Properties

| Property | Type | Default | Description
| --- | --- | --- | ---
|**x** | `number` | `0` | The x-coordinate.
|**y** | `number` | `0` | The y-coordinate.

### shinejs.Point.prototype.delta(p)

Returns a new instance of `shinejs.Point` with the x- and y-distance between this instance and the point `p`.

| Parameter | Type | Description
| --- | --- | ---
| **p** | `shinejs.Point` | The point to which to calculate the distance to. Distance will be expressed as `this.x - p.x` and `this.y - p.y`.
