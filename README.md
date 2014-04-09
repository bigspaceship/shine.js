# shine.js

*A library for pretty shadows.*

## Get Started

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

Create a shared Config instance:

```javascript
// default values:
var config = new shinejs.Config({
  numSteps: 8, // The number of steps drawn in each shadow
  opacity: 0.1, // The opacity of each shadow (range: 0...1)
  opacityPow: 1.2, // The exponent applied to each step's opacity (1.0 = linear opacity).
  offset: 0.15, // Larger offsets create longer shadows
  offsetPow: 1.8, // The exponent applied to each step's offset (1.0 = linear offset).
  blur: 0.1, // The strength of the shadow blur.
  blurPow: 1.4, // The exponent applied to each step's blur (1.0 = linear blur).
  maxBlurRadius: 64, // The maximum blur radius
  shadowRGB: new shinejs.Color(0, 0, 0), //
});

// pass it in the constructor

var shineA = new Shine(document.getElementById('my-shine-object-a'), config);
var shineB = new Shine(document.getElementById('my-shine-object-b'), config);

// or assign later

var shineC = new Shine(document.getElementById('my-shine-object-c'));
shineC.config = config;
shineC.draw(); // make sure to re-draw

```

## API

### Shine Class

*Note: `Shine` is also mapped to `shinejs.Shine`. Use the long version if `Shine` is already defined.*

#### Shine(domElement, optConfig, optClassPrefix, optShadowProperty)

The Shine constructor. Instantiate as `new Shine(...)` to create a new instance.

| Parameter | Type | Description
| ---
| domElement | `!HTMLElement` | The DOM element to apply the shine effect to.
| optConfig | `?shinejs.Config=` | Optional config instance. If no instance is passed it a new instance with default values will be stored in the `config` property.
| optClassPrefix | `?string=` | Optional class prefix that will be applied to all shine DOM elements. Defaults to `shine-`.
| optShadowProperty | `?string=` | Optional property name that the shadow will be applied to. Overrides the automatic detection for use of either `textShadow` or `boxShadow`. The value will be applied as `element.style[shadowProperty] = '...'` and automatically prefixed for legacy browsers (e.g. `MozBoxShadow`).

#### Shine.prototype.draw()

Draws all shadows based on the current light position. Call this method whenever a shine parameter is changed.

#### Shine.prototype.destroy()

Releases all resources and removes event listeners. Destroyed instance can't be reused and must be discarded.
