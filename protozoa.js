// Protozoa v0.1.0
// MIT License
// © 2017 Gus Cost

var EMPTY = [];
var RESERVED = /tag|namespace|init|children/;

var protozoa = function (tmpl) {

  // Create HTML node (from CellJS)
  var $node;
  if (tmpl.tag === "svg") {
    $node = document.createElementNS("http://www.w3.org/2000/svg", tmpl.tag);
    $node._meta = { namespace: $node.namespaceURI };
  } else if (tmpl.namespace) {
    $node = document.createElementNS(tmpl.namespace, tmpl.tag);
    $node._meta = { namespace: $node.namespaceURI };
  } else if (tmpl.tag === "fragment") {
    $node = document.createDocumentFragment();
  } else if (typeof tmpl === "object") {
    $node = document.createElement(tmpl.tag || "div");
  } else if (typeof tmpl === "function") {
    $node = document.createTextNode(tmpl());
  } else if (typeof tmpl === "string") {
    $node = document.createTextNode(tmpl);
  } else {
    console.error("Unknown template: " + tmpl);
  }

  // Set all non-reserved properties on the node
  if (typeof tmpl === "object") {
    Object.getOwnPropertyNames(tmpl).forEach(function (key) {
      if (key === "class" || key === "className") {
        $node.class = tmpl[key];
        $node.className = tmpl[key];
      } else if (!RESERVED.test(key)) {
        $node[key] = tmpl[key];
      }
    });
  }

  // Immutable properties, must recreate to change these
  $node.tag = tmpl.tag;
  $node.init = tmpl.init || function () { };

  // Mutable/magic `children` property
  Object.defineProperty($node, "children", {
    get: function (children) {
      return children;
    },
    set: function (children) {
      $node.innerHTML = "";
      children.forEach(function (child) {
        var element = protozoa(child);
        if (child.children) {
          child.children.forEach(function (grandchild) {
            element.appendChild(protozoa(grandchild));
          });
        }
        $node.appendChild(element);
      });
      return children;
    }
  });

  // Kick it off
  $node.children = tmpl.children || EMPTY;
  $node.init();

  // That's it??
  return $node;
}
