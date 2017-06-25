/**
 * Protozoa v1.7
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

    // Create DOM Node (adapted from https://github.com/intercellular/cell)
    var _node;
    var type = typeof tmpl;
    if (type === 'object') {
      if (tmpl.tag === 'svg') {
        _node = document.createElementNS('http://www.w3.org/2000/svg', tmpl.tag);
      } else if (tmpl.namespace) {
        _node = document.createElementNS(tmpl.namespace, tmpl.tag);
      } else if (tmpl.tag === 'fragment') {
        _node = document.createDocumentFragment();
      } else {
        _node = document.createElement(tmpl.tag || 'div');
      }
      Object.getOwnPropertyNames(tmpl).forEach(function (key) {
        if (key === 'class' || key === 'className') {
          _node.class = tmpl[key];      // Most browsers are OK with `class`
          _node.className = tmpl[key];  // Safari needs `className`
        } else if (key === 'style') {
          _node.setAttribute('style', tmpl[key]);  // Style is weird
        } else if (!RESERVED_WORDS.test(key)) {
          _node[key] = tmpl[key];  // Copy anything that isn't reserved
        }
      });
    } else {
      _node = document.createTextNode(type === 'function' ? tmpl() : tmpl);
    }

    // Recursive kernel describes what to do with nested values or templates
    var _kernel = tmpl.kernel || function (node, children) {
      // Recurse through the tree!
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
    Object.defineProperty(_node, 'kernel', {
      get: function () { return _kernel; },
      set: function () { console.error('Cannot mutate kernel!'); }
    });

    // Mutable/magic `children` property (and `ch` alias)
    if (type === 'object') {
      var _children = [];
      Object.defineProperty(_node, 'children', {
        get: function () { return _children; },
        set: function (value) {
          _node.innerHTML = '';
          _children = _node.kernel(_node, value);
        }
      });
      Object.defineProperty(_node, 'ch', {
        get: function () { return _node.children; },
        set: function (value) { return _node.children = value; }
      });

      // Set `children` and run `init()`
      _node.children = tmpl.children || tmpl.ch || EMPTY_SET;
      if (tmpl.init) { _node.init(); }
    }

    // That's it??
    return _node;
  }

  // Module API is just the protozoa function
  return protozoa;
}));
