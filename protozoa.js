/**
 * Protozoa v1.9
 * MIT License
 * Copyright 2017 Gus Cost
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.protozoa = factory();
  }
}(this, function () {
  'use strict';

  // Constants
  var EMPTY_SET = [];
  var RESERVED_WORDS = /kernel|children|ch/;

  // Protozoa is a recursive function that takes a template tree
  function protozoa (tmpl) {
    var $node;
    var type = typeof tmpl;

    // Create Text node for everything that isn't a template object
    if (type !== 'object') {
      $node = document.createTextNode(type === 'function' ? tmpl() : tmpl);
    } else {

      // SVG elements need a special namespace
      $node = tmpl.tag === 'svg' ?
        document.createElementNS('http://www.w3.org/2000/svg', tmpl.tag) :
        document.createElement(tmpl.tag || 'div');

      // Set all non-reserved template properties on the DOM node
      Object.getOwnPropertyNames(tmpl).forEach(function (key) {
        if (key === 'class' || key === 'className') {
          $node.class = tmpl[key];      // Most browsers are OK with `class`
          $node.className = tmpl[key];  // Safari needs `className`
        } else if (key === 'style') {
          $node.setAttribute('style', tmpl[key]);  // Style is weird
        } else if (!RESERVED_WORDS.test(key)) {
          $node[key] = tmpl[key];  // Copy anything that isn't reserved
        }
      });

      // Recursive kernel describes what to do with nested values or templates
      var _kernel = tmpl.kernel || function (node, children) {
        // Helper to recurse through the tree!
        function recurse(child) {
          var _child = protozoa(child);
          if (child.ref) { node[child.ref] = _child; }
          return node.appendChild(_child);
        }
        // `children` can be an array of nested templates
        if (Array.isArray(children)) {
          return children.map(function (child) { return recurse(child); });
        // Or a single template object, or any other value
        } else {
          return recurse(children);
        }
      };

      // Immutable `kernel` property
      Object.defineProperty($node, 'kernel', {
        get: function () { return _kernel; },
        set: function () { console.error('Cannot mutate kernel!'); }
      });

      // Mutable/magic `children` property (and `ch` alias)
      var _children = [];
      Object.defineProperty($node, 'children', {
        get: function () { return _children; },
        set: function (value) {
          $node.innerHTML = '';
          _children = $node.kernel($node, value);
        }
      });
      Object.defineProperty($node, 'ch', {
        get: function () { return $node.children; },
        set: function (value) { return $node.children = value; }
      });

      // Set `children` and run `init()`
      $node.children = tmpl.children || tmpl.ch || EMPTY_SET;
      if (tmpl.init) { $node.init(); }

    }

    // That's it??
    return $node;
  }

  // Module API is just the protozoa function
  return protozoa;
}));
