;(function (jshp, undefined) {
  // Private members
  var doc = document;

  // Public methods
  jshp.get = function (selector) {
    return doc.querySelectorAll(selector);
  };

  jshp.create = function (tag) {
    return doc.createElement(tag);
  };

  jshp.append = function (element, target) {
    target.appendChild(element);
  };

  jshp.text = function (element, text) {
    var t = doc.createTextNode(text);
    jshp.append(t, element);
  };

  /* your code goes here */

})(window.jshp = window.jshp || {});
