const ua = require("./ua.js");

test("Multiple UAs are available and can be cycled through", () => {
  let origin = "https://www.example.com";
  let expected = expect.stringMatching(/\S/);
  let next, all = [];
  for (;;) {
    next = ua.next(origin);
    expect(next).toEqual(expected);
    if (all.indexOf(next) >= 0) {
      break;
    }
    all.push(next);
  }
  expect(all.length).toBeGreaterThanOrEqual(8);
  for (let i = 0; i < all.length; ++i) {
    expect(next).toBe(all[i]);
    next = ua.next(origin);
  }
});
