// Protozoa v0.1.2
// MIT License
// © 2017 Gus Cost

var EMPTY = [];
var RESERVED = /tag|ns|ref|children|init/;

var protozoa = function (tmpl) {

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
    } else if (tmpl.ns) {
      _node = document.createElementNS(tmpl.ns, tmpl.tag);
    } else if (tmpl.tag === "fragment") {
      _node = document.createDocumentFragment();
    } else {
      _node = document.createElement(tmpl.tag || "div");
    }
  } else {
    console.error("Unknown template: " + tmpl);
  }

  // Set all non-reserved properties on the Node
  if (typeof tmpl === "object") {
    Object.getOwnPropertyNames(tmpl).forEach(function (key) {
      if (key === "class" || key === "className") {
        _node.class = tmpl[key];
        _node.className = tmpl[key];
      } else if (!RESERVED.test(key)) {
        _node[key] = tmpl[key];
      }
    });
  }

  // Mutable/magic `children` property
  var _children = [];
  Object.defineProperty(_node, "children", {
    get: function () {
      return _children;
    },
    set: function (value) {
      _node.innerHTML = "";
      _children = value.map(function (child) {
        var _child = protozoa(child);
        if (child.ref) { _node[child.ref] = _child; }
        return _node.appendChild(_child);
      });
    }
  });

  // Set reserved properties and run `init()`
  _node.tag = tmpl.tag;
  _node.ns = tmpl.ns;
  _node.ref = tmpl.ref;
  _node.children = tmpl.children || EMPTY;
  if (tmpl.init) {
    _node.init = tmpl.init.bind(_node);
    _node.init();
  }

  // That's it??
  return _node;
}
