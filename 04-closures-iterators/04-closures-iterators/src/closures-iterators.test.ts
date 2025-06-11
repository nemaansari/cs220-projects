import _assert from "assert";
import { listToArray, arrayToList } from "../include/lists.js";
// listToArray and arrayToList are provided for your testing convenience only.
import { composeList, composeFunctions, composeBinary, enumRatios, cycleArr, dovetail } from "./closures-iterators.js";

describe("composeList", () => {
  it("Apply all functions to a list", () => {
    const list = arrayToList([1, 2, 3]);
    const f1 = (x: number) => x + 1;
    const f2 = (x: number) => x * 2;
    const f3 = (x: number) => x - 3;

    const composed = composeList(arrayToList([f1, f2, f3]));
    const result = listToArray(list.map(composed));
    expect(result).toEqual([1, 3, 5]);
  });

  it("Empty list should return empty list", () => {
    const list = arrayToList([]);
    const f1 = (x: number) => x + 1;

    const composed = composeList(arrayToList([f1]));
    const result = listToArray(list.map(composed));
    expect(result).toEqual([]);
  });

  it("Should return the same list if no functions are applied", () => {
    const list = arrayToList([1, 2, 3]);

    const composed = composeList(arrayToList([]));
    const result = listToArray(list.map(composed));
    expect(result).toEqual([1, 2, 3]);
  });

  it("Should work with a list of strings", () => {
    const list = arrayToList(["a", "b", "c"]);
    const f1 = (x: string) => x + "1";
    const f2 = (x: string) => x + "2";
    const f3 = (x: string) => x + "3";

    const composed = composeList(arrayToList([f1, f2, f3]));
    const result = listToArray(list.map(composed));
    expect(result).toEqual(["a123", "b123", "c123"]);
  });

  it("Should work with a list of decimals", () => {
    const list = arrayToList([1.5, 2.5, 3.3]);
    const f1 = (x: number) => x + 1;
    const f2 = (x: number) => x * 2;
    const f3 = (x: number) => x - 3;

    const composed = composeList(arrayToList([f1, f2, f3]));
    const result = listToArray(list.map(composed));
    expect(result).toEqual([2, 4, 5.6]);
  });

  it("Should work with a list of booleans", () => {
    const list = arrayToList([true, false, true]);
    const f1 = (x: boolean) => !x;
    const f2 = (x: boolean) => !x;
    const f3 = (x: boolean) => !x;

    const composed = composeList(arrayToList([f1, f2, f3]));
    const result = listToArray(list.map(composed));
    expect(result).toEqual([false, true, false]);
  });

  it("Should be able to apply the same function multiple times", () => {
    const list = arrayToList([1, 2, 3]);
    const f1 = (x: number) => x + 1;

    const composed = composeList(arrayToList([f1, f1, f1]));
    const result = listToArray(list.map(composed));
    expect(result).toEqual([4, 5, 6]);
  });

  it("Should work with a list of objects", () => {
    const list = arrayToList([{ a: 1 }, { a: 2 }, { a: 3 }]);
    const f1 = (x: { a: number }) => ({ a: x.a + 1 });
    const f2 = (x: { a: number }) => ({ a: x.a * 2 });
    const f3 = (x: { a: number }) => ({ a: x.a - 3 });

    const composed = composeList(arrayToList([f1, f2, f3]));
    const result = listToArray(list.map(composed));
    expect(result).toEqual([{ a: 1 }, { a: 3 }, { a: 5 }]);
  });

  it("Should work with a single function", () => {
    const list = arrayToList([1, 2, 3]);
    const f1 = (x: number) => x + 1;

    const composed = composeList(arrayToList([f1]));
    const result = listToArray(list.map(composed));
    expect(result).toEqual([2, 3, 4]);
  });

  it("Should work when given an identity function", () => {
    const list = arrayToList([1, 2, 3]);
    const f1 = (x: number) => x;

    const composed = composeList(arrayToList([f1, f1, f1]));
    const result = listToArray(list.map(composed));
    expect(result).toEqual([1, 2, 3]);
  });

  // Tests for composeList go here
});

describe("composeFunctions", () => {
  it("Return a closure that applies all functions", () => {
    const f1 = (x: number) => x + 1;
    const f2 = (x: number) => x * 2;
    const f3 = (x: number) => x - 3;

    const composed = composeFunctions([f1, f2, f3]);
    const result = composed(1);
    expect(result).toEqual([1, 2, 4, 1]);
  });

  it("Given no functions should return the provided value", () => {
    const composed = composeFunctions([]);
    const result = composed(1);
    expect(result).toEqual([1]);
  });

  it("Should work with a list of strings", () => {
    const f1 = (x: string) => x + "1";
    const f2 = (x: string) => x + "2";
    const f3 = (x: string) => x + "3";

    const composed = composeFunctions([f1, f2, f3]);
    const result = composed("a");
    expect(result).toEqual(["a", "a1", "a12", "a123"]);
  });

  it("Should work with a decimal", () => {
    const f1 = (x: number) => x + 1;
    const f2 = (x: number) => x * 2;
    const f3 = (x: number) => x - 3;

    const composed = composeFunctions([f1, f2, f3]);
    const result = composed(1.5);
    expect(result).toEqual([1.5, 2.5, 5, 2]);
  });

  it("Should work with a boolean", () => {
    const f1 = (x: boolean) => !x;
    const f2 = (x: boolean) => !x;
    const f3 = (x: boolean) => !x;

    const composed = composeFunctions([f1, f2, f3]);
    const result = composed(true);
    expect(result).toEqual([true, false, true, false]);
  });

  it("Should be able to apply the same function multiple times", () => {
    const f1 = (x: number) => x + 1;

    const composed = composeFunctions([f1, f1, f1]);
    const result = composed(1);
    expect(result).toEqual([1, 2, 3, 4]);
  });

  it("If the function does nothing, should return the same value", () => {
    const f1 = (x: number) => x;

    const composed = composeFunctions([f1, f1, f1]);
    const result = composed(1);
    expect(result).toEqual([1, 1, 1, 1]);
  });

  it("Should work with single function", () => {
    const f1 = (x: number) => x + 1;

    const composed = composeFunctions([f1]);
    const result = composed(1);
    expect(result).toEqual([1, 2]);
  });

  // Tests for composeFunctions go here
});

describe("composeBinary", () => {
  it("Should return a closure that takes an input in: U and returns a function T => T", () => {
    const f1 = (x: number, y: number) => x + y;
    const f2 = (x: number, y: number) => x * y;
    const f3 = (x: number, y: number) => x - y;

    const composed = composeBinary([f1, f2, f3]);
    const apply = composed(2);
    const result = apply(3);
    expect(result).toEqual(8);
  });

  it("If given no functions, should return the identity function", () => {
    const composed = composeBinary([]);
    const apply = composed(2);
    const result = apply(3);
    expect(result).toEqual(3);
  });

  it("Should work with string inputs", () => {
    const f1 = (x: string, y: string) => x + y;
    const f2 = (x: string, y: string) => x + y;
    const f3 = (x: string, y: string) => x + y;

    const composed = composeBinary([f1, f2, f3]);
    const apply = composed("a");
    const result = apply("b");
    expect(result).toEqual("baaa");
  });

  it("Should work with objects", () => {
    const f1 = (x: { a: number }, y: { a: number }) => ({ a: x.a + y.a });
    const f2 = (x: { a: number }, y: { a: number }) => ({ a: x.a * y.a });
    const f3 = (x: { a: number }, y: { a: number }) => ({ a: x.a - y.a });

    const composed = composeBinary([f1, f2, f3]);
    const apply = composed({ a: 2 });
    const result = apply({ a: 3 });
    expect(result).toEqual({ a: 8 });
  });

  it("Should work with a single function", () => {
    const f1 = (x: number, y: number) => x + y;

    const composed = composeBinary([f1]);
    const apply = composed(2);
    const result = apply(3);
    expect(result).toEqual(5);
  });

  it("Should work with a single function that does nothing", () => {
    const f1 = (x: number, _y: number) => x;

    const composed = composeBinary([f1]);
    const apply = composed(2);
    const result = apply(3);
    expect(result).toEqual(3);
  });

  it("Should work with a single function that returns a different value", () => {
    const f1 = (x: number, y: number) => y;

    const composed = composeBinary([f1]);
    const apply = composed(2);
    const result = apply(3);
    expect(result).toEqual(2);
  });

  it("Should work with negative and decimal numbers", () => {
    const f1 = (x: number, y: number) => x + y;
    const f2 = (x: number, y: number) => x * y;
    const f3 = (x: number, y: number) => x - y;

    const composed = composeBinary([f1, f2, f3]);
    const apply = composed(-2.5);
    const result = apply(3);
    expect(result).toEqual(1.25);
  });

  // Tests for composeBinary go here
});

describe("enumRatios", () => {
  it("should return a new rational number from the sequence", () => {
    const generateRations = enumRatios();

    expect(generateRations()).toEqual(1);
    expect(generateRations()).toEqual(2);
    expect(generateRations()).toEqual(0.5);
    expect(generateRations()).toEqual(3);
    expect(generateRations()).toEqual(0.3333333333333333);
    expect(generateRations()).toEqual(4);
    expect(generateRations()).toEqual(1.5);
    expect(generateRations()).toEqual(0.6666666666666666);
    expect(generateRations()).toEqual(0.25);
  });

  it("should maintain state between calls", () => {
    const generateRatios = enumRatios();

    const first = generateRatios();
    const second = generateRatios();
    const third = generateRatios();

    const newGenerator = enumRatios();
    expect(newGenerator()).toEqual(first);
    expect(newGenerator()).toEqual(second);
    expect(newGenerator()).toEqual(third);
  });

  it("should generate unique values in the sequence (no duplicates)", () => {
    const generateRatios = enumRatios();

    const results = new Array<number>();
    for (let i = 0; i < 20; i++) {
      results.push(generateRatios());
    }

    expect(results.length).toEqual(20);
  });

  // Tests for enumRatios go here
});

describe("cycleArr", () => {
  it("Should return a new array with the elements cycled", () => {
    const input = [
      [1, 2, 3],
      [4, 5],
      [6, 7, 8, 9],
    ];
    const iterator = cycleArr(input);

    const result: number[] = [];
    while (iterator.hasNext()) {
      result.push(iterator.next());
    }

    expect(result).toEqual([1, 4, 6, 2, 5, 7, 3, 8, 9]);
  });

  it("If empty, should throw an error", () => {
    const iterator = cycleArr([]);
    expect(() => {
      iterator.next();
    }).toThrow("No more elements");
  });

  it("If given a subarray of length 0, should skip it", () => {
    const input = [[1, 2, 3], [], [6, 7, 8, 9]];
    const iterator = cycleArr(input);

    const result: number[] = [];
    while (iterator.hasNext()) {
      result.push(iterator.next());
    }

    expect(result).toEqual([1, 6, 2, 7, 3, 8, 9]);
  });

  it("If given an undefined subarray element, should throw an error", () => {
    const input = [[1, 2, 3], [undefined], [6, 7, 8, 9]];
    const iterator = cycleArr(input);

    expect(iterator.next()).toEqual(1);
    expect(() => {
      iterator.next();
    }).toThrow("Undefined value");
  });

  it("Should work with negative and decimal numbers", () => {
    const input = [
      [-1, 2.5, 3],
      [4, -5],
      [6, 7, 8, 9],
    ];
    const iterator = cycleArr(input);

    const result: number[] = [];
    while (iterator.hasNext()) {
      result.push(iterator.next());
    }

    expect(result).toEqual([-1, 4, 6, 2.5, -5, 7, 3, 8, 9]);
  });

  it("Should work with a single subarray", () => {
    const input = [[1, 2, 3]];
    const iterator = cycleArr(input);

    const result: number[] = [];
    while (iterator.hasNext()) {
      result.push(iterator.next());
    }

    expect(result).toEqual([1, 2, 3]);
  });

  it("Should work with a single element", () => {
    const input = [[1]];
    const iterator = cycleArr(input);

    const result: number[] = [];
    while (iterator.hasNext()) {
      result.push(iterator.next());
    }

    expect(result).toEqual([1]);
  });

  it("Should work with a single empty subarray", () => {
    const input = [[]];
    const iterator = cycleArr(input);

    const result: number[] = [];
    while (iterator.hasNext()) {
      result.push(iterator.next());
    }

    expect(result).toEqual([]);
  });

  it("Should work with a single undefined subarray", () => {
    const input = [[undefined]];
    const iterator = cycleArr(input);

    expect(() => {
      iterator.next();
    }).toThrow("Undefined value");
  });

  it("Should work with a single subarray with undefined elements", () => {
    const input = [[undefined, undefined, undefined]];
    const iterator = cycleArr(input);

    expect(() => {
      iterator.next();
    }).toThrow("Undefined value");
  });

  it("Should work with a single subarray with a mix of undefined and defined elements", () => {
    const input = [[1, undefined, 3]];
    const iterator = cycleArr(input);

    expect(iterator.next()).toEqual(1);
    expect(() => {
      iterator.next();
    }).toThrow("Undefined value");
  });

  // Tests for cycleArr go here
});

describe("dovetail", () => {
  it("Should return a new array with the elements dovetailed", () => {
    const list1 = arrayToList([1, 2, 3]);
    const list2 = arrayToList([4, 5]);
    const list3 = arrayToList([6, 7, 8, 9]);

    const iterator = dovetail([list1, list2, list3]);

    const result: number[] = [];
    while (iterator.hasNext()) {
      result.push(iterator.next());
    }

    expect(result).toEqual([1, 2, 4, 3, 5, 6, 7, 8, 9]);
  });

  it("If empty, should throw an error", () => {
    const iterator = dovetail([]);
    expect(() => {
      iterator.next();
    }).toThrow("No more elements");
  });

  it("If given an undefined value, throw an error", () => {
    const list1 = arrayToList([1, 2, 3]);
    const list2 = arrayToList([undefined]);
    const list3 = arrayToList([6, 7, 8, 9]);

    const iterator = dovetail([list1, list2, list3]);

    expect(iterator.next()).toEqual(1);
    expect(iterator.next()).toEqual(2);
    expect(() => {
      iterator.next();
    }).toThrow("Undefined value");
  });

  it("Should continue to next round when no elements were added but more lists remain", () => {
    const list1 = arrayToList([1]);
    const list2 = arrayToList([]);
    const list3 = arrayToList([]);
    const list4 = arrayToList([2, 3]);

    const iterator = dovetail([list1, list2, list3, list4]);

    const result: number[] = [];
    while (iterator.hasNext()) {
      result.push(iterator.next());
    }

    expect(result).toEqual([1, 2, 3]);
  });

  it("Should not refill the queue if elements still exist", () => {
    const list1 = arrayToList([1, 2]);
    const list2 = arrayToList([3, 4]);

    const iterator = dovetail([list1, list2]);

    expect(iterator.next()).toEqual(1);

    expect(iterator.hasNext()).toEqual(true);

    expect(iterator.next()).toEqual(2);

    expect(iterator.next()).toEqual(3);
  });

  it("Should work with negative and decimal numbers", () => {
    const list1 = arrayToList([-1, 2.5, 3]);
    const list2 = arrayToList([4, -5]);
    const list3 = arrayToList([6, 7, 8, 9]);

    const iterator = dovetail([list1, list2, list3]);

    const result: number[] = [];
    while (iterator.hasNext()) {
      result.push(iterator.next());
    }

    expect(result).toEqual([-1, 2.5, 4, 3, -5, 6, 7, 8, 9]);
  });

  it("Should work with a single list", () => {
    const list1 = arrayToList([1, 2, 3]);

    const iterator = dovetail([list1]);

    const result: number[] = [];
    while (iterator.hasNext()) {
      result.push(iterator.next());
    }

    expect(result).toEqual([1, 2, 3]);
  });

  it("Should work with a single element", () => {
    const list1 = arrayToList([1]);

    const iterator = dovetail([list1]);

    const result: number[] = [];
    while (iterator.hasNext()) {
      result.push(iterator.next());
    }

    expect(result).toEqual([1]);
  });

  it("Should work with a single empty list", () => {
    const list1 = arrayToList([]);

    const iterator = dovetail([list1]);

    const result: number[] = [];
    while (iterator.hasNext()) {
      result.push(iterator.next());
    }

    expect(result).toEqual([]);
  });

  it("Should work with a single undefined list", () => {
    const list1 = arrayToList([undefined]);

    const iterator = dovetail([list1]);

    expect(() => {
      iterator.next();
    }).toThrow("Undefined value");
  });
});
