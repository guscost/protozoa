<img src="https://cdn.rawgit.com/guscost/protozoa/trunk/logo-dark.svg" width=300 />

A micro-app generator.

## Usage
See [demo](https://guscost.github.io/protozoa) and [demo source](https://github.com/guscost/protozoa/blob/trunk/index.html) for an ES5 example. The `protozoa` package is also available on NPM.

The protozoa module itself is just one factory function that is called with a template. Calling it looks like this:

```js
var element = protozoa({
  tag: 'div',
  children: [
    'Hello ',
    { tag: 'strong', children: 'world!' }
  ]
});
```

### Template API
The template API borrows heavily from [cell](https://www.celljs.org/). All properties are optional:
- `namespace`: the HTML namespace (`<svg>` is automatic)
- `tag`: the name of the HTML Node to create, if unspecified it will be a `<div>`
- `ref`: the name of a property that the parent element can access for convenience
- `init`: a function to run when the Node is created, with the Node as `this`
- `children`: a string, number, function, or an array of values or nested templates
- `ch`: an alias for `children`

The function returns an ordinary DOM Node with a few additions. You can append this Node anywhere in your HTML page:

```js
document.body.appendChild(element);
```

### DOM Node API
Container DOM Nodes returned by `protozoa` have a special array property `children` which controls the Node's contents. Assigning to this property will empty out the containing DOM node and append the new structure in its place:

```js
element.children = ['Something Else'];
```

### Advanced API
The template reserves an additional property: `kernel`. This property is used to set or retrieve the immutable kernel function that protozoa uses to walk recursively through a nested spec. If you didn't understand the previous sentence, you should probably leave it alone.

### Other properties
That's pretty much it. All other properties are treated as native [IDL attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#Content_versus_IDL_attributes) (with preprocessing for `class`, `className` and `style`). Specifying `class` OR `className` will set the Node's `class` AND `className` attributes. Style has weird behavior and you can't use that property to store arbitrary strings. Anything not used by the browser is fair game for your functions, state objects, or whatever else your Node needs.

See [demo](https://github.com/guscost/protozoa/blob/trunk/index.html) for an example using a flux-like message bus.

## Concept
A "micro-app" is a web app that is all of the following:
- _Small_ (not rendering more than ten thousand items)
- _Composable_ (able to be controlled and extended with a simple API)
- _Embedded_ (no model, no viewmodel, no virtual DOM, just the real DOM)

## It's just the DOM
The micro-app architecture is based on a restriction: All "components" must be DOM Nodes, and all extra functionality must be built into those same objects. With ReactJS every component instance must be linked to a single DOM Node, so why not just start with the DOM Node and build all the component functionality into that? Bam, no more headaches from immutable `value` props, the DOM Node has a value and that's all that is necessary. This package should be mostly compatible back to IE9, but if IDL event or attribute compatibility is an issue, you can set up handlers with jQuery in the init() function instead of using those. 

Remember back in the day when you could query the DOM and actually *do* something with an element? With this architecture, that's how *everything* works!

## Safety not guaranteed
If you've worked with the real DOM, you should already know that there are significant pitfalls with any approach. This way is no different. Careful not to overwrite any important attributes with data, because those are your DOM Nodes!

Custom properties on DOM Nodes was looked down on for years probably because of this risk, but we're adults and we can be careful.

## The real tradeoff is performance
A complex UI rendered by emptying out containers and dumping in new DOM Nodes means a lot of screen repaints. This architecture should be chosen with the assumption that apps will be smaller and simpler. The `init()` template API makes it easy to only redraw certain parts of an app in response to any kind of state engine, so a UI built in this way can still be optimized. [Metazoa](https://github.com/guscost/metazoa) is an attempt to inject DOM-diffing and other behaviors into a protozoa-like framework.

But sometimes the best solution is to break apart your page into smaller apps that communicate with each other but don't need to keep a huge state in sync with a huge UI. More on this approach soon.
