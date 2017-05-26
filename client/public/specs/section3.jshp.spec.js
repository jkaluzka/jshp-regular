/* global describe, beforeEach, afterEach, it, expect, jasmine */

describe('JavaScriptHasPower - section 3 [Events and Ajax]', function () {
  'use strict';

  beforeEach(function () {
    jasmine.Ajax.install();

    this.onSuccessSpy = jasmine.createSpy('success');
    this.onFailureSpy = jasmine.createSpy('failure');

    jasmine.Ajax.stubRequest('/jshp/index').andReturn({
      status: 200,
      responseText: '{ "response": "data" }',
    });

    jasmine.Ajax.stubRequest('/jshp/not-found').andReturn({
      status: 404,
      responseText: 'page not found',
    });
  });

  afterEach(function () {
    jasmine.Ajax.uninstall();
  });

  it('should make a successful ajax request', function () {
    jshp.ajaxGet({url: '/jshp/index'}, this.onSuccessSpy, this.onFailureSpy);

    expect(this.onSuccessSpy).toHaveBeenCalled();
    expect(this.onFailureSpy).not.toHaveBeenCalled();
  });

  it('should make POST ajax request', function () {
    jshp.ajaxPost({url: '/jshp/index'}, this.onSuccessSpy, this.onFailureSpy);

    expect(jasmine.Ajax.requests.mostRecent().method).toBe('POST');
    expect(this.onSuccessSpy).toHaveBeenCalled();
    expect(this.onFailureSpy).not.toHaveBeenCalled();
  });

  it('should call a custom function with proper context on failure', function () {
    var context = {javaScript: 'has power'};

    var onFailure = function (xhr, status, responseText) {
      expect(status).toBe(404);
      expect(responseText).toBe('page not found');
      expect(this).toBe(context);
      expect(this.javaScript).toBe('has power');
    };

    var methods = {
      onFailure: onFailure,
    };

    spyOn(methods, 'onFailure').and.callFake(onFailure);

    jshp.ajaxGet({url: '/jshp/not-found'}, this.onSuccessSpy, methods.onFailure, context);

    expect(methods.onFailure).toHaveBeenCalled();
    expect(this.onSuccessSpy).not.toHaveBeenCalled();
  });

  it('should call a custom function with proper context on success', function () {
    var context = {javaScript: 'has power'};

    var onSuccess = function (data, status, xhr) {
      expect(status).toBe(200);
      expect(data.response).toBe('data');
      expect(this).toBe(context);
      expect(this.javaScript).toBe('has power');
    };

    var methods = {
      onSuccess: onSuccess,
    };

    spyOn(methods, 'onSuccess').and.callFake(onSuccess);

    jshp.ajaxGet({url: '/jshp/index'}, methods.onSuccess, this.onFailureSpy, context);

    expect(methods.onSuccess).toHaveBeenCalled();
    expect(this.onFailureSpy).not.toHaveBeenCalled();
  });

  it('should make POST ajax request with data', function () {
    var expectedRequestData = {
      id: '123',
      firstName: 'Batman',
    };

    jshp.ajaxPost({url: '/jshp/index', data: expectedRequestData}, this.onSuccessSpy, this.onFailureSpy);

    var request = jasmine.Ajax.requests.mostRecent();
    expect(request.method).toBe('POST');
    expect(request.url).toBe('/jshp/index');
    var d = request.data();
    expect(d.id).toEqual('123');
    expect(d.firstName).toEqual('Batman');
    expect(this.onSuccessSpy).toHaveBeenCalled();
    expect(this.onFailureSpy).not.toHaveBeenCalled();
  });
});

describe('JavaScriptHasPower - section 3 [EventListeners]', function () {
  'use strict';

  var $selectedElement, selectedElement, methods;

  beforeEach(function () {
    affix('#bigPower');

    methods = {
      showPower: jasmine.createSpy('showPower() spy').and.callFake(function () {
        console.log('JavaScript in Power mode');
      }),

      givePower: jasmine.createSpy('showPower() spy').and.callFake(function () {
        var txt = '==> JavaScript giving Power ==>';
        console.log(txt);
        return txt;
      }),
    };

    $selectedElement = jshp.get('#bigPower');
    selectedElement = $selectedElement[0];
  });

  var trigger = function (element, event) {
    var evt = document.createEvent('HTMLEvents');
    evt.initEvent(event, true, false);
    element.dispatchEvent(evt);
  };

  it('should be able to add a click event to an HTML element', function () {
    jshp.on(selectedElement, 'click', methods.showPower);

    selectedElement.click();
    expect(methods.showPower).toHaveBeenCalled();
  });

  it('should support adding the same event twice to an HTML element', function () {
    jshp.on(selectedElement, 'click', methods.showPower);
    jshp.on(selectedElement, 'click', methods.showPower);

    trigger(selectedElement, 'click');
    // https://jsfiddle.net/jkaluzka/gLqrap30/
    expect(methods.showPower.calls.count()).toEqual(1);
  });

  it('should be able to add the same callback for two different events to an HTML element', function () {
    jshp.addListener(selectedElement, 'click', methods.showPower);
    jshp.addListener(selectedElement, 'hover', methods.showPower);

    trigger(selectedElement, 'click');
    trigger(selectedElement, 'hover');

    expect(methods.showPower.calls.count()).toEqual(2);
  });

  it('should be able to add two different callbacks for same event to an HTML element', function () {
    jshp.addListener(selectedElement, 'click', methods.showPower);
    jshp.addListener(selectedElement, 'click', methods.givePower);

    trigger(selectedElement, 'click');

    expect(methods.showPower.calls.count()).toEqual(1);
    expect(methods.givePower.calls.count()).toEqual(1);
  });

  it('should be able to remove one event handler of an HTML element', function () {
    jshp.addListener(selectedElement, 'click', methods.showPower);
    jshp.addListener(selectedElement, 'click', methods.givePower);
    jshp.removeListeners(selectedElement, 'click', methods.showPower);

    trigger(selectedElement, 'click');

    expect(methods.showPower.calls.count()).toEqual(0);
    expect(methods.givePower.calls.count()).toEqual(1);
  });

  it('should be able to remove all events of a type of a HTML element', function () {
    jshp.addListener(selectedElement, 'click', methods.showPower);
    jshp.addListener(selectedElement, 'click', methods.givePower);
    jshp.addListener(selectedElement, 'hover', methods.showPower);

    jshp.removeListeners(selectedElement, 'click');

    trigger(selectedElement, 'hover');
    trigger(selectedElement, 'click');

    expect(methods.showPower.calls.count()).toEqual(1);
    expect(methods.givePower).not.toHaveBeenCalled();
  });

  it('should be able to remove all events of a HTML element', function () {
    jshp.addListener(selectedElement, 'click', methods.showPower);
    jshp.addListener(selectedElement, 'click', methods.givePower);
    jshp.addListener(selectedElement, 'hover', methods.showPower);

    jshp.removeListeners(selectedElement);

    var eventHover = new Event('hover');
    var eventClick = new Event('click');

    selectedElement.dispatchEvent(eventClick);
    selectedElement.dispatchEvent(eventHover);

    expect(methods.showPower).not.toHaveBeenCalled();
    expect(methods.givePower).not.toHaveBeenCalled();
  });

  it('should not trigger method registered on element A when event id triggered on element B', function () {
    var elementA = document.createElement('div');
    var elementB = document.createElement('div');
    selectedElement.append(elementA);
    selectedElement.append(elementB);

    jshp.addListener(elementA, 'click', methods.showPower);
    jshp.addListener(elementB, 'click', methods.givePower);

    $(elementA).trigger('click');

    expect(methods.showPower).toHaveBeenCalled();
    expect(methods.givePower).not.toHaveBeenCalled();
  });
});
