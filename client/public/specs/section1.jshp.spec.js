/* global describe, beforeEach, afterEach, it, expect, jshp */

describe('JavaScriptHasPower - section 1 [JS DOM basic]', function () {
  'use strict';

  beforeEach(function () {
    affix('.element #id-element input[class="awesome"] input[type="coolName"] button[name="btn"]');
  });

  afterEach(function () {
    $('.element').remove();
  });

  it('should not return element', function () {
    var selector = '.no-item';
    var el = jshp.get(selector);

    expect(el.length).toBe(0);
  });

  it('should select element based on tag name', function () {
    var tagSelector = 'button';
    var expected = $.makeArray($(tagSelector));
    var el = jshp.get(tagSelector);

    expect(el.length).toBe(1);
    expect(el[0] instanceof HTMLElement).toBe(true);
    expect(el[0].tag).toBe(expected[0].tag);
  });

  it('should select element based on class name', function () {
    var classSelector = '.element';
    var expected = $.makeArray($(classSelector));
    var el = jshp.get(classSelector);

    expect(el.length).toBe(1);
    expect(el[0] instanceof HTMLElement).toBe(true);
    expect(el[0]).toBe(expected[0]);
  });

  it('should select element based on id name', function () {
    var idSelector = '#id-element';
    var expected = $.makeArray($(idSelector));
    var el = jshp.get(idSelector);

    expect(el.length).toBe(1);
    expect(el[0] instanceof HTMLElement).toBe(true);
    expect(el[0]).toBe(expected[0]);
  });

  it('should create an element', function () {
    var selector = 'div';
    var expected = $('<div>');
    var el = jshp.create(selector);

    expect(el instanceof HTMLElement).toBe(true);
    expect(el.tag).toBe(expected[0].tag);
  });

  it('should set text in an element', function () {
    var selector = '.element';
    var stringValue = 'some not very long text';
    var expected = $.makeArray($(selector).text(stringValue))[0];

    var el = jshp.get(selector)[0];
    jshp.text(el, stringValue);

    expect(el instanceof HTMLElement).toBe(true);
    expect(el).toBe(expected);
    expect(el.textContent).toBe(expected.textContent);
  });
});
