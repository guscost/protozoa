// protozoa v0.2.5
// MIT License
// Copyright 2017 Gus Cost

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.protozoa = factory();
  }
}(this, function () {

  // Constants
  var EMPTY = [];

  // Protozoa is a single recursive function
  function protozoa (tmpl) {

    // Create HTML Node (adapted from https://github.com/intercellular/cell)
    var _node;
    if (typeof tmpl === "string") {
      _node = document.createTextNode(tmpl);
    } else if (typeof tmpl === "number") {
      _node = document.createTextNode(tmpl.toString());
    } else if (typeof tmpl === "function") {
      _node = document.createTextNode(tmpl());
    } else if (typeof tmpl === "object") {
      if (tmpl.tag === "svg") {
        _node = document.createElementNS("http://www.w3.org/2000/svg", tmpl.tag);
      } else if (tmpl.namespace) {
        _node = document.createElementNS(tmpl.namespace, tmpl.tag);
      } else if (tmpl.tag === "fragment") {
        _node = document.createDocumentFragment();
      } else {
        _node = document.createElement(tmpl.tag || "div");
      }
    } else {
      console.error("Unknown template: " + tmpl);
    }

    // Set properties on the Node
    if (typeof tmpl === "object") {
      Object.getOwnPropertyNames(tmpl).forEach(function (key) {
        if (key === "class" || key === "className") {
          _node.class = tmpl[key];
          _node.className = tmpl[key];
        } else if (key === "style") {
          _node.setAttribute("style", tmpl[key]);
        } else if (key !== "children") {
          _node[key] = tmpl[key];
        }
      });
    }

    // Mutable/magic `children` property
    var _children = [];
    var children = {
      get: function () { return _children; },
      set: function (value) {
        _node.innerHTML = "";
        _children = value.map(function (child) {
          var _child = protozoa(child);
          if (child.ref) { _node[child.ref] = _child; }
          return _node.appendChild(_child);
        });
      }
    };
    Object.defineProperty(_node, "children", children);
    Object.defineProperty(_node, "ch", children);

    // Set `children` and run `init()`
    _node.children = tmpl.children || EMPTY;
    if (tmpl.init) { _node.init(); }

    // That's it??
    return _node;
  };

  // Module API is just the protozoa function
  return protozoa;
}));
