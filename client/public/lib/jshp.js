;(function (jshp, undefined) {
  // Private members
  var doc = document;

  // Public methods
  jshp.get = function (selector) {
    return doc.querySelectorAll(selector);
  };

  jshp.findChildren = function (parent, selector) {
    return parent.querySelectorAll(selector);
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

  jshp.empty = function (element) {
    element.innerHTML = '';
  };

  jshp.data = function (element, datasetName, datasetValue) {
    if (typeof datasetValue !== 'undefined') {
      element.dataset[datasetName] = datasetValue;
    }
    return element.dataset[datasetName];
  };

  jshp.ready = function (fn) {
    if (doc.readyState != 'loading') {
      fn();
    } else {
      doc.addEventListener('DOMContentLoaded', fn);
    }
  };

  // support for simple events
  jshp.on = function (element, event, callback, capture) {
    element.addEventListener(event, callback, capture);
  };

  jshp.off = function (element, eventName, eventHandler) {
    element.removeEventListener(eventName, eventHandler);
  };

  // support for more fancy events
  var _eventHandlers = {};  // storage for events
  jshp.addListener = function (element, event, handler, capture=false) {
    if (!(element in _eventHandlers)) {
      // _eventHandlers stores references to elements
      _eventHandlers[element] = {};
    }
    if (!(event in _eventHandlers[element])) {
      // prepare handlers container for this event
      _eventHandlers[element][event] = [];
    }
    // capture reference
    _eventHandlers[element][event].push([handler, capture]);
    jshp.on(element, event, handler, capture);
  };

  jshp.removeListeners = function (element, event, callback) {
    if (element in _eventHandlers) {
      var handlers = _eventHandlers[element];
      if (!event) {
        // if no event, remove all events for that element
        for (var evt in handlers) {
          if (handlers.hasOwnProperty(evt)) {
            jshp.removeListeners(element, evt);
          }
        }
      } else if (event in handlers) {
        var eventHandlers = handlers[event];
        if (!!callback) {
          // remove only this handler
          jshp.off(element, event, callback);
        } else {
          // remove all handlers for that event
          for (var i = eventHandlers.length; i--;) {
            var handler = eventHandlers[i];
            jshp.off(element, event, handler[0], handler[1]);
          }
        }
      }
    }
  };

  // support for ajax
  jshp.ajax = function (options, handleSuccess, handleError, context) {
    var opt = {
      async: true,
    };

    if (!options.url) {
      throw Error('url option required !!!');
    }

    options = Object.assign({}, options, opt);

    var request = new XMLHttpRequest();
    request.onreadystatechange = handleData;
    request.open(options.method, options.url, options.async);
    if (options.method.toUpperCase() === 'POST') {
      request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
      request.send(JSON.stringify(options.data));
    } else {
      request.send();
    }

    function handleData () {
      var self = context || this;
      if (request.readyState === request.DONE) {
        var data = request.responseText;
        if (request.status >= 200 && request.status < 400) {
          if (typeof handleSuccess === 'function') {
            handleSuccess.call(self, JSON.parse(data), request.status, request);
          }
        } else {
          if (typeof handleError === 'function') {
            handleError.call(self, request, request.status, data);
          }
        }
      }
    }
  };

  jshp.ajaxGet = function (options, handleSuccess, handleError, context) {
    var opts = Object.assign({}, options, {method: 'GET'});
    jshp.ajax(opts, handleSuccess, handleError, context);
  };

  jshp.ajaxPost = function (options, handleSuccess, handleError, context) {
    var opts = Object.assign({}, options, {method: 'POST'});
    jshp.ajax(opts, handleSuccess, handleError, context);
  };

  if (typeof (String.prototype.startsWith) !== 'function') {
    String.prototype.startsWith = function (needle) {
      return this.indexOf(needle) === 0;
    };
  }

})(window.jshp = window.jshp || {});
