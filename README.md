# protozoa
a micro-app generator

![protozoa logo](logo.jpg)

## Usage
See [demo.html](demo.html) for an ES5 example. Also available on NPM.

The protozoa module itself is just one factory function that is called with a template. Calling it looks like this:

```js
var el = protozoa({
  tag: "div",
  children: [
    "Hello ",
    { tag: "strong", children: ["world!"] }
  ]
});
```

The function basically returns a DOM Node with a few additions. You can append this Node anywhere in your HTML page:

```js
document.body.appendChild(el);
```

More information on the template and DOM Node APIs coming soon. The template API (and many concepts) borrow heavily from [cell](https://www.celljs.org/). See [demo.html](demo.html) in the meantime.

## Concept
A "micro-app" is a web app that is all of the following:
- Small (not rendering more than ten thousand items)
- Composable (able to be controlled and extended via a simple API)
- Embedded (no model, no viewmodel, no virtual DOM, just the real DOM)

## It's just the DOM
The micro-app architecture is based on a restriction: All "components" must be DOM Nodes, and all extra functionality must be built into those very same objects. With ReactJS every rendered component must be linked to a single DOM Node, so why not just start with the DOM Node and build all our component functionality into that? Voila, no more headaches from immutable `value` props, the DOM Node has a value and that is all that ever needs to exist.

Remember back in the day when you could query the DOM and actually *do* something with an element? With this architecture, that's how *everything* works!

## Safety not guaranteed
As a low-level DOM wrangler, you should already know that there are pitfalls with any approach. This one is no different - careful not to overwrite any important attributes with data, because those are your DOM Nodes!

Adding custom properties to DOM Nodes was looked down on for years probably because of this risk, but we're all adults, right?

## The real tradeoff is performance
Because of this choice, a complex UI rendered by emptying out containers and dumping in new DOM Nodes means a lot of screen repaints. This architecture should be chosen with the assumption that apps will be smaller and simpler. The `init()` template API makes it easy to only redraw certain parts of an app in response to any kind of state engine, so a UI built in this way can still be optimized, but sometimes a better solution is to break apart your page into smaller apps that communicate with each other but don't need to keep a huge state in sync with a huge UI. More along those lines soon.
