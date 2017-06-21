/**
 * protozoa v1.2.1
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
  var LEAF_NODES = /string|number|function/;

  // Protozoa is a single recursive function
  function protozoa (tmpl) {

    // Create DOM Node (adapted from https://github.com/intercellular/cell)
    var _node;
    var type = typeof tmpl;
    if (LEAF_NODES.test(type)) {
      _node = document.createTextNode(type === 'function' ? tmpl() : tmpl);
    } else if (type === 'object') {
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
      console.error('Invalid template: ' + tmpl);
    }

    // Recursive kernel describes what to do with nested values or templates
    var _kernel = tmpl.kernel || function (children) {
      return children.map(function (child) {
        var _child = protozoa(child); // Recurse through the tree!
        if (child.ref) { _node[child.ref] = _child; }
        return _node.appendChild(_child);
      })
    };

    // Only allow retrieving or running the kernel function
    Object.defineProperty(_node, 'kernel', {
      get: function () { return _kernel },
      set: function () { console.error('Cannot update kernel!'); }
    });

    // Mutable/magic `children` property (and `ch` alias)
    if (!LEAF_NODES.test(type)) {
      var _children = [];
      Object.defineProperty(_node, 'children', {
        get: function () { return _children; },
        set: function (value) {
          _node.innerHTML = '';
          if (LEAF_NODES.test(typeof value)) { // Can be string/number/function
            return _node.appendChild(protozoa(value)); 
          } else if (Array.isArray(value)) { // Or an array of nested templates
            _children = _node.kernel(value);
          } else {  
            console.error('Invalid children: ' + value);
          }
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
  };

  // Module API is just the protozoa function
  return protozoa;
}));
