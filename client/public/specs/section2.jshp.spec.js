/* global describe, beforeEach, afterEach, it, expect */

describe('JavaScriptHasPower - section 2 [JS DOM advanced]', function () {
  'use strict';
  beforeEach(function () {
    affix('.element #id-element input[class="awesome"] input[type="coolName"] button[name="btn"]');
  });

  afterEach(function () {
    $('.element').remove();
  });

  it('should add css class to an element', function () {
    var selector = '.element';
    var className = 'new-class-name';
    var expected = $.makeArray($(selector).addClass(className))[0];

    var el = jshp.get(selector)[0];
    jshp.addClass(el, className);

    expect(el instanceof HTMLElement).toBe(true);
    expect(el).toBe(expected);
    expect(el.classList).toBe(expected.classList);
  });

  it('should toggle css class on an element when class is not present', function () {
    var selector = '.element';
    var className = 'toggle-class-name';
    var expected = $(selector);

    var el = jshp.get(selector)[0];
    jshp.toggleClass(el, className);

    expect(el instanceof HTMLElement).toBe(true);
    expect(expected.hasClass(className)).toBe(true);
  });

  it('should toggle css class on an element when class is present', function () {
    var selector = '.element';
    var className = 'toggle-class-name';
    var expected = $(selector);

    var el = jshp.get(selector)[0];
    jshp.addClass(el, className);
    jshp.toggleClass(el, className);

    expect(el instanceof HTMLElement).toBe(true);
    expect(expected.hasClass(className)).toBe(false);
  });

  it('should remove a css class of an element', function () {
    var selector = '.element';
    var className = 'remove-this-class-name';
    var expected = $(selector);

    var el = jshp.get(selector)[0];
    jshp.addClass(el, className);
    jshp.removeClass(el, className);

    expect(el instanceof HTMLElement).toBe(true);
    expect(expected.hasClass(className)).toBe(false);
  });

  it('should not generate an error when removing non existing css class of an element', function () {
    var selector = '.element';
    var className = 'remove-this-class-name';
    var expected = $(selector);

    var el = jshp.get(selector)[0];
    jshp.removeClass(el, className);

    expect(el instanceof HTMLElement).toBe(true);
    expect(expected.hasClass(className)).toBe(false);
  });

  it('should set css property on an element', function () {
    var selector = '.element';
    var expected = $.makeArray($(selector));

    var element = jshp.get(selector)[0];
    jshp.css(element, 'width', '100px');
    jshp.css(element, 'height', '10px');
    jshp.css(element, 'border-radius', '50%');

    expect($(element).css('width')).toBe('100px');
    expect($(element).css('height')).toBe('10px');
    expect($(element).css('border-radius')).toBe('50%');
  });

  it('should set multiple css properties on an element', function () {
    var selector = '.element';
    var expected = $.makeArray($(selector));

    var element = jshp.get(selector)[0];
    jshp.css(element, {
      'width': '100px',
      'height': '10px',
      'border-radius': '50%',
    });

    expect($(element).css('width')).toBe('100px');
    expect($(element).css('height')).toBe('10px');
    expect($(element).css('border-radius')).toBe('50%');
  });

  it('should return css property of an element', function () {
    var selector = '.element';
    var expected = $(selector);
    var element = jshp.get(selector)[0];

    expected.css('display', 'none');

    expect(jshp.css(element, 'display')).toBe('none');
  });

  it('should create an element', function () {
    var selector = 'div.status';
    var expected = $('<div>').addClass('status');
    var el = jshp.create(selector);

    expect(el instanceof HTMLElement).toBe(true);
    expect(el.tag).toBe(expected[0].tag);
    expect(el.classList.contains('status')).toBe(true);
  });
});
