import { Stream, to } from "../include/stream.js";
import {
  addSeries,
  prodSeries,
  derivSeries,
  coeff,
  evalSeries,
  applySeries,
  expSeries,
  recurSeries,
} from "./series.js";

function expectStreamToBe<T>(s: Stream<T>, a: T[]) {
  for (const element of a) {
    expect(s.isEmpty()).toBe(false);
    expect(s.head()).toBe(element);

    s = s.tail();
  }

  expect(s.isEmpty()).toBe(true);
}

describe("addSeries", () => {
  it("adds simple streams together", () => {
    // Open `include/stream.ts` to learn how to use `to`
    // 1 -> 2 -> 3 -> 4 -> 5
    const a = to(1, 5);
    const b = to(1, 5);
    const c = addSeries(a, b);

    expectStreamToBe(c, [2, 4, 6, 8, 10]);
  });
});

describe("prodSeries", () => {
  it("multiple simple streams together", () => {
    const a = to(1, 3);
    const b = to(1, 3);
    const c = prodSeries(a, b);

    expectStreamToBe(c, [1, 4, 10, 12, 9]);
  });
  // More tests for prodSeries go here
});

describe("derivSeries", () => {
  it("gets derivative of simple stream", () => {
    const a = to(1, 3);
    const c = derivSeries(a);

    expectStreamToBe(c, [2, 6]);
  });

  // More tests for derivSeries go here
});

describe("coeff", () => {
  it("returns array of coefficients up to degree n", () => {
    const a = to(1, 4);
    const c = coeff(a, 2);
    expect(c).toEqual([1, 2, 3]);
  });

  // More tests for coeff go here
});

describe("evalSeries", () => {
  it("should return the sum of the values of all the terms up to degree n", () => {
    const a = to(1, 5);
    const x = 3;
    const sum = evalSeries(a, 3)(x);
    expect(sum).toEqual(142);
  });

  // More tests for evalSeries go here
});

describe("applySeries", () => {
  it("Should return a series with each input doubled", () => {
    const f = (x: number) => x + 1;
    const v = 0;

    const s = applySeries(f, v);

    expect(s.head()).toEqual(0);
    expect(s.tail().head()).toEqual(1);
    expect(s.tail().tail().head()).toEqual(2);
    expect(s.tail().tail().tail().head()).toEqual(3);
  });
  // More tests for applySeries go here
});

describe("expSeries", () => {
  it("Should calculate the taylor series", () => {
    const series = expSeries();

    expect(series.head()).toEqual(1);
    expect(series.tail().head()).toEqual(1);
    expect(series.tail().tail().head()).toEqual(0.5);
    expect(series.tail().tail().tail().head()).toEqual(1 / 6);
    expect(series.tail().tail().tail().tail().head()).toEqual(1 / 24);
  });
  // More tests for expSeries go here
});

describe("recurSeries", () => {
  it("Should correctly calculated the series", () => {
    const coeff = [1, 1];
    const init = [0, 1];

    const s = recurSeries(coeff, init);

    expect(s.head()).toEqual(0);
    expect(s.tail().head()).toEqual(1);
    expect(s.tail().tail().head()).toEqual(1);
    expect(s.tail().tail().tail().head()).toEqual(2);
    expect(s.tail().tail().tail().tail().head()).toEqual(3);
  });
  // More tests for recurSeries go here
});
