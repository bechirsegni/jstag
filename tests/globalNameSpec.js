/* global jstag, jstag2, __lytics__jstag__ */
describe("when the `data-lytics-global` attribute is specified", function() {
  it("should write to that global name instead of `jstag`", function() {
    expect(typeof jstag).toBe('undefined');
    expect(jstag2).toBe('__lytics__jstag__');
  });
});
