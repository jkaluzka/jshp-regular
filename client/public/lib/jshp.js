;(function (jshp, undefined) {
  // Private members
  var doc = document;

  // Public methods
  jshp.get = function (selector) {
    return doc.querySelectorAll(selector);
  };

  jshp.create = function (tag) {
    var classes = [];
    if (tag.indexOf('.') > 0) {
      var tagWithClass = tag.split('.');
      tag = tagWithClass[0];
      classes = tagWithClass.slice(1);
    }
    var element = doc.createElement(tag);
    if (classes.length) {
      classes.map(function (cls) {
        jshp.addClass(element, cls);
      });
    }
    return element;
  };

  jshp.append = function (element, target) {
    target.appendChild(element);
  };

  jshp.text = function (element, text) {
    var t = doc.createTextNode(text);
    jshp.append(t, element);
  };

  jshp.addClass = function (element, className) {
    element.classList.add(className);
  };

  jshp.toggleClass = function (element, classValue) {
    if (element.classList.contains(classValue)) {
      jshp.removeClass(element, classValue);
    } else {
      jshp.addClass(element, classValue);
    }
  };

  jshp.removeClass = function (element, className) {
    element.classList.remove(className);
  };

  jshp.setAttr = function (element, attrName, attrValue) {
    element.setAttribute(attrName, attrValue);
  };

  jshp.getAttr = function (element, attrName) {
    return element.getAttribute(attrName);
  };

  jshp.attr = function (element, attrName, attrValue) {
    if (typeof attrValue !== 'undefined') {
      jshp.setAttr(element, attrName, attrValue);
    } else {
      return jshp.getAttr(element, attrName);
    }
  };

  jshp.css = function (element, styleName, newValue) {
    if (typeof styleName === 'object') {
      Object.keys(styleName).map(function (name) {
        element.style[name] = styleName[name];
      });
      return;
    }
    if (typeof newValue !== 'undefined') {
      element.style[styleName] = newValue;
    }
    return getComputedStyle(element)[styleName];
  };

  /* your code goes here */

})(window.jshp = window.jshp || {});
