/* global describe, beforeEach, afterEach, it, expect */

describe('JavaScriptHasPower - section 0 [init]', function () {
  'use strict';

  var a;
  var foo;

  beforeEach(function () {
    foo = 1;
  });

  afterEach(function () {
    foo = 0;
  });

  it('should not fail', function () {
    expect(true).toBe(true);
  });

  it('expect a to be true', function () {
    expect(a).toBe(undefined);
    a = true;
    expect(a).toBe(true);
  });

  it('sets the initial value of foo before specs run', function () {
    expect(foo).toEqual(1);
    foo += 1;
  });

  it('reset foo between specs', function () {
    expect(foo).toEqual(1);
  });
});
