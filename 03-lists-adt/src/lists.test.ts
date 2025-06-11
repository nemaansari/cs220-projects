import assert from "assert";
import { node, empty, listToArray, arrayToList } from "../include/lists.js";
// listToArray and arrayToList are provided for your testing convenience only.
import {
  insertOrdered,
  everyNRev,
  everyNCond,
  keepTrendMiddles,
  keepLocalMaxima,
  keepLocalMinima,
  keepLocalMinimaAndMaxima,
  nonNegativeProducts,
  negativeProducts,
  deleteFirst,
  deleteLast,
  squashList,
} from "./lists.js";

describe("insertOrdered", () => {
  it("should add a single number at the end of list", () => {
    const lst = node(1, node(2, node(3, empty())));

    const newList = insertOrdered(lst, 4);

    assert(newList.head() === 1);
    expect(newList.tail().head()).toEqual(2);
    expect(newList.tail().tail().head()).toEqual(3);
    expect(newList.tail().tail().tail().head()).toEqual(4);
  });

  it("should add a single number at the beginning of list", () => {
    const lst = node(1, node(2, node(3, empty())));

    const newList = insertOrdered(lst, 0);

    expect(newList.head()).toEqual(0);
    expect(newList.tail().head()).toEqual(1);
    expect(newList.tail().tail().head()).toEqual(2);
    expect(newList.tail().tail().tail().head()).toEqual(3);
  });

  it("should add a single number in the middle of list", () => {
    const lst = node(1, node(2, node(3, empty())));

    const newList = insertOrdered(lst, 2);

    expect(newList.head()).toEqual(1);
    expect(newList.tail().head()).toEqual(2);
    expect(newList.tail().tail().head()).toEqual(2);
    expect(newList.tail().tail().tail().head()).toEqual(3);
  });

  it("Should work with decimals", () => {
    const lst = node(1, node(2, node(3, empty())));

    const newList = insertOrdered(lst, 2.5);

    expect(listToArray(newList)).toEqual([1, 2, 2.5, 3]);
  });

  it("Should work with negative numbers", () => {
    const lst = node(1, node(2, node(3, empty())));

    const newList = insertOrdered(lst, -1);

    expect(listToArray(newList)).toEqual([-1, 1, 2, 3]);
  });

  it("Should work with empty list", () => {
    const lst = arrayToList([]);

    const newList = insertOrdered(lst, 1);

    expect(listToArray(newList)).toEqual([1]);
  });

  it("Should be able to do the operation multiple times", () => {
    const lst = arrayToList([1, 2, 3]);

    const newList = insertOrdered(insertOrdered(insertOrdered(lst, 4), 5), 6);

    expect(listToArray(newList)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("Should handle multiple duplicates", () => {
    const lst = arrayToList([1, 2, 3]);

    const newList = insertOrdered(insertOrdered(insertOrdered(lst, 2), 2), 2);

    expect(listToArray(newList)).toEqual([1, 2, 2, 2, 2, 3]);
  });

  it("Should work with already sorted list with repeated numbers", () => {
    const lst = arrayToList([1, 2, 2, 2, 3]);

    const newList = insertOrdered(lst, 2);

    expect(listToArray(newList)).toEqual([1, 2, 2, 2, 2, 3]);
  });

  it("Should handle a list containing negative and positive numbers", () => {
    const lst = arrayToList([-1, 0, 1]);

    const newList = insertOrdered(lst, 0);

    expect(listToArray(newList)).toEqual([-1, 0, 0, 1]);
  });

  it("Should handle decimals", () => {
    const lst = arrayToList([1, 2, 3]);

    const newList = insertOrdered(lst, 2.5);

    expect(listToArray(newList)).toEqual([1, 2, 2.5, 3]);
  });

  it("Should handle large numbers", () => {
    const lst = arrayToList([1, 2, 3]);

    const newList = insertOrdered(lst, 1000000);

    expect(listToArray(newList)).toEqual([1, 2, 3, 1000000]);
  });

  // Tests for insertOrdered go here
});

describe("everyNRev", () => {
  it("Should correctly get every nth element and reverse it", () => {
    const lst = node(1, node(2, node(3, node(4, node(5, node(6, empty()))))));

    const newList = everyNRev(lst, 3);

    expect(newList.head()).toEqual(6);
    expect(newList.tail().head()).toEqual(3);
  });

  it("Should be an empty list if n is greater than the length of the list", () => {
    const lst = node(1, node(2, node(3, node(4, node(5, node(6, empty()))))));

    const newList = everyNRev(lst, 7);

    expect(newList.isEmpty()).toEqual(true);
  });

  it("Should be an empty list if n is 0", () => {
    const lst = node(1, node(2, node(3, node(4, node(5, node(6, empty()))))));

    const newList = everyNRev(lst, 0);

    expect(newList.isEmpty()).toEqual(true);
  });

  it("Should be an empty list if the list is empty", () => {
    const lst = empty();

    const newList = everyNRev(lst, 3);

    expect(newList.isEmpty()).toEqual(true);
  });

  it("Should reverse list if n is 1", () => {
    const lst = node(1, node(2, node(3, node(4, node(5, node(6, empty()))))));

    const newList = everyNRev(lst, 1);

    expect(listToArray(newList)).toEqual([6, 5, 4, 3, 2, 1]);
  });

  it("Should work if n is the length of the list", () => {
    const lst = node(1, node(2, node(3, node(4, node(5, node(6, empty()))))));

    const newList = everyNRev(lst, 6);

    expect(listToArray(newList)).toEqual([6]);
  });

  it("Should handle list of one value", () => {
    const lst = node(1, empty());

    const newList = everyNRev(lst, 1);

    expect(listToArray(newList)).toEqual([1]);
  });

  it("Should handle 0 as the value", () => {
    const lst = node(0, node(1, node(2, node(3, node(4, node(5, node(6, empty())))))));

    const newList = everyNRev(lst, 0);

    expect(newList.isEmpty()).toEqual(true);
  });

  // Tests for everyNRev go here
});

describe("everyNCond", () => {
  it("Should return every nth even number", () => {
    const lst = node(1, node(2, node(3, node(4, node(5, node(6, empty()))))));

    const cond = (e: number) => e % 2 === 0;

    const newList = everyNCond(lst, 2, cond);

    expect(listToArray(newList)).toEqual([4]);
  });

  it("Should return every nth odd number.", () => {
    const lst = node(1, node(2, node(3, node(4, node(5, node(6, empty()))))));

    const cond = (e: number) => e % 2 !== 0;

    const newList = everyNCond(lst, 2, cond);

    expect(listToArray(newList)).toEqual([3]);
  });

  it("Should return an empty list if n is greater than the length of the list", () => {
    const lst = node(1, node(2, node(3, node(4, node(5, node(6, empty()))))));

    const cond = (e: number) => e % 2 === 0;

    const newList = everyNCond(lst, 7, cond);

    expect(newList.isEmpty()).toEqual(true);
  });

  it("If condition is never true, return an empty list", () => {
    const lst = node(1, node(2, node(3, node(4, node(5, node(6, empty()))))));

    const cond = (e: number) => e % 2 === 3;

    const newList = everyNCond(lst, 2, cond);

    expect(newList.isEmpty()).toEqual(true);
  });

  it("Condition always returns true should return every nth element", () => {
    const lst = node(1, node(2, node(3, node(4, node(5, node(6, empty()))))));

    const cond = (_e: number) => true;

    const newList = everyNCond(lst, 2, cond);

    expect(listToArray(newList)).toEqual([2, 4, 6]);
  });

  it("n is 1 should return every element that satisfies the condition", () => {
    const lst = node(1, node(2, node(3, node(4, node(5, node(6, empty()))))));

    const cond = (e: number) => e % 2 === 0;

    const newList = everyNCond(lst, 1, cond);

    expect(listToArray(newList)).toEqual([2, 4, 6]);
  });

  // Tests for everyNCond go here
});

describe("keepTrendMiddles", () => {
  it("Should return a new list [5, 8, 10]", () => {
    const lst = arrayToList([3, 5, 8, 10, 15, 7]);
    const allSatisfy = (prev: number, curr: number, next: number) => curr > prev && curr < next;

    const result = keepTrendMiddles(lst, allSatisfy);
    expect(listToArray(result)).toEqual([5, 8, 10]);
  });

  it("Should return an empty list if provided with empty list", () => {
    const lst = arrayToList([]);
    const allSatisfy = (prev: number, curr: number, next: number) => curr > prev && curr < next;

    const result = keepTrendMiddles(lst, allSatisfy);

    expect(listToArray(result)).toEqual([]);
  });

  it("Should handle list with all equal elements", () => {
    const lst = arrayToList([1, 1, 1, 1, 1, 1]);
    const allSatisfy = (prev: number, curr: number, next: number) => curr > prev && curr < next;

    const result = keepTrendMiddles(lst, allSatisfy);

    expect(listToArray(result)).toEqual([]);
  });

  it("Should handle list with two elements", () => {
    const lst = arrayToList([1, 2]);
    const allSatisfy = (prev: number, curr: number, next: number) => curr > prev && curr < next;

    const result = keepTrendMiddles(lst, allSatisfy);

    expect(listToArray(result)).toEqual([]);
  });

  it("No elements satisfy the condition should return empty list", () => {
    const lst = arrayToList([1, 2, 3, 4, 5]);
    const allSatisfy = (prev: number, curr: number, next: number) => curr < prev && curr > next;

    const result = keepTrendMiddles(lst, allSatisfy);

    expect(listToArray(result)).toEqual([]);
  });

  it("Should handle list with one element", () => {
    const lst = arrayToList([1]);
    const allSatisfy = (prev: number, curr: number, next: number) => curr > prev && curr < next;

    const result = keepTrendMiddles(lst, allSatisfy);

    expect(listToArray(result)).toEqual([]);
  });

  it("First and last elements should not be included", () => {
    const lst = arrayToList([1, 2, 3, 4, 5]);
    const allSatisfy = (prev: number, curr: number, next: number) => curr > prev && curr < next;

    const result = keepTrendMiddles(lst, allSatisfy);

    expect(listToArray(result)).toEqual([2, 3, 4]);
  });
  // Tests for keepTrendMiddles go here
});

describe("keepLocalMaxima", () => {
  it("Should return a new list [3, 6]", () => {
    const lst = arrayToList([1, 2, 3, 2, 1, 4, 5, 6, 5, 4, 3, 2, 1]);
    const result = keepLocalMaxima(lst);

    expect(listToArray(result)).toEqual([3, 6]);
  });

  it("Should return an empty list if provided with empty list", () => {
    const lst = arrayToList([]);
    const result = keepLocalMaxima(lst);

    expect(listToArray(result)).toEqual([]);
  });

  it("First and last elements should not be included", () => {
    const lst = arrayToList([1, 0, 3, 2, 5, 6, 7, 8, 9, 10]);
    const result = keepLocalMaxima(lst);

    expect(listToArray(result)).toEqual([3]);
  });

  it("Should return an empty list if provided with all decreasing numbers", () => {
    const lst = arrayToList([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
    const result = keepLocalMaxima(lst);

    expect(listToArray(result)).toEqual([]);
  });

  it("List with all same elements should return empty list", () => {
    const lst = arrayToList([1, 1, 1, 1, 1, 1]);
    const result = keepLocalMaxima(lst);

    expect(listToArray(result)).toEqual([]);
  });

  it("Single element list should return empty list", () => {
    const lst = arrayToList([1]);
    const result = keepLocalMaxima(lst);

    expect(listToArray(result)).toEqual([]);
  });

  // Tests for keepLocalMaxima go here
});

describe("keepLocalMinima", () => {
  it("Should return a new list [1, 4]", () => {
    const lst = arrayToList([1, 2, 3, 2, 1, 4, 5, 6, 5, 4, 6, 2, 1]);
    const result = keepLocalMinima(lst);

    expect(listToArray(result)).toEqual([1, 4]);
  });

  it("Should return an empty list if provided with empty list", () => {
    const lst = arrayToList([]);
    const result = keepLocalMinima(lst);

    expect(listToArray(result)).toEqual([]);
  });

  it("First and last elements should not be included", () => {
    const lst = arrayToList([8, 9, 8, 7, 6, 1, 4, 3, 2, 1]);
    const result = keepLocalMinima(lst);

    expect(listToArray(result)).toEqual([1]);
  });

  it("Should return an empty list if provided with all increasing numbers", () => {
    const lst = arrayToList([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const result = keepLocalMinima(lst);

    expect(listToArray(result)).toEqual([]);
  });

  it("List with all same elements should return empty list", () => {
    const lst = arrayToList([1, 1, 1, 1, 1, 1]);
    const result = keepLocalMinima(lst);

    expect(listToArray(result)).toEqual([]);
  });

  it("Single element list should return empty list", () => {
    const lst = arrayToList([1]);
    const result = keepLocalMinima(lst);

    expect(listToArray(result)).toEqual([]);
  });
  // Tests for keepLocalMinima go here
});

describe("keepLocalMinimaAndMaxima", () => {
  it("Should return a new list with local minima and maxima", () => {
    const lst = arrayToList([1, 2, 3, 2, 1, 4, 5, 6, 5, 4, 6, 2, 1]);
    const result = keepLocalMinimaAndMaxima(lst);

    expect(listToArray(result)).toEqual([1, 3, 4, 6, 6]);
  });

  it("Should return an empty list if provided with empty list", () => {
    const lst = arrayToList([]);
    const result = keepLocalMinimaAndMaxima(lst);

    expect(listToArray(result)).toEqual([]);
  });

  it("If no local maxima or minima, return an empty list", () => {
    const lst = arrayToList([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const result = keepLocalMinimaAndMaxima(lst);

    expect(listToArray(result)).toEqual([]);
  });

  it("List with all same elements should return empty list", () => {
    const lst = arrayToList([1, 1, 1, 1, 1, 1]);
    const result = keepLocalMinimaAndMaxima(lst);

    expect(listToArray(result)).toEqual([]);
  });

  it("Should handle a list with only one element", () => {
    const lst = arrayToList([1]);
    const result = keepLocalMinimaAndMaxima(lst);

    expect(listToArray(result)).toEqual([]);
  });

  it("Should handle decimals", () => {
    const lst = arrayToList([1.1, 2.2, 3.3, 4.4, 5.5]);
    const result = keepLocalMinimaAndMaxima(lst);

    expect(listToArray(result)).toEqual([]);
  });
  // Tests for keepLocalMinimaAndMaxima go here
});

describe("nonNegativeProducts", () => {
  it("Should return a new list with non-negative products", () => {
    const lst = arrayToList([2, 3, -1, 0.5, 2]);
    const result = nonNegativeProducts(lst);

    expect(listToArray(result)).toEqual([2, 6, 0.5, 1]);
  });

  it("Should return an empty list if provided with empty list", () => {
    const lst = arrayToList([]);
    const result = nonNegativeProducts(lst);

    expect(listToArray(result)).toEqual([]);
  });

  it("Should return an empty list if provided with all negative numbers", () => {
    const lst = arrayToList([-1, -2, -3, -4, -5, -6, -7, -8, -9, -10]);
    const result = nonNegativeProducts(lst);

    expect(listToArray(result)).toEqual([]);
  });

  // Tests for nonNegativeProducts go here
});

describe("negativeProducts", () => {
  it("Should return a new list with negative products", () => {
    const lst = arrayToList([-3, -6, 2, -2, -1, -2]);
    const result = negativeProducts(lst);

    expect(listToArray(result)).toEqual([-3, 18, -2, 2, -4]);
  });

  it("Should return an empty list if provided with empty list", () => {
    const lst = arrayToList([]);
    const result = negativeProducts(lst);

    expect(listToArray(result)).toEqual([]);
  });

  it("Should return an empty list if provided with all positive numbers", () => {
    const lst = arrayToList([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const result = negativeProducts(lst);

    expect(listToArray(result)).toEqual([]);
  });

  it("Should work with decimals", () => {
    const lst = arrayToList([-3.5, -3.5]);

    const result = negativeProducts(lst);

    expect(listToArray(result)).toEqual([-3.5, 12.25]);
  });

  // Tests for nonNegativeProducts go here
});

describe("deleteFirst", () => {
  it("Should return a new list with the first occurrence of the element removed", () => {
    const lst = arrayToList([1, 2, 3, 4, 5, 6, 7, 8, 9, 5, 10]);
    const result = deleteFirst(lst, 5);

    expect(listToArray(result)).toEqual([1, 2, 3, 4, 6, 7, 8, 9, 5, 10]);
  });

  it("Should return empty list if the list is empty", () => {
    const lst = arrayToList([]);
    const result = deleteFirst(lst, 5);

    expect(listToArray(result)).toEqual([]);
  });

  it("Should return same list if value given is not in list", () => {
    const lst = arrayToList([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const result = deleteFirst(lst, 11);

    expect(listToArray(result)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("Should return empty if there is only a head and it is the value", () => {
    const lst = arrayToList([1]);
    const result = deleteFirst(lst, 1);

    expect(listToArray(result)).toEqual([]);
  });

  it("Should handle if an element appears multiple times consecutively", () => {
    const lst = arrayToList([1, 2, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const result = deleteFirst(lst, 2);

    expect(listToArray(result)).toEqual([1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("Should handle a list with the element being both tie first and last", () => {
    const lst = arrayToList([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1]);
    const result = deleteFirst(lst, 1);

    expect(listToArray(result)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 1]);
  });

  // Tests for deleteFirst go here
});

describe("deleteLast", () => {
  it("Should return a new list with the last occurrence of the element removed", () => {
    const lst = arrayToList([1, 2, 3, 4, 5, 6, 7, 8, 9, 5, 10]);
    const result = deleteLast(lst, 5);

    console.log(listToArray(result));
    expect(listToArray(result)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("Should return empty list if the list is empty", () => {
    const lst = arrayToList([]);
    const result = deleteLast(lst, 4);

    expect(listToArray(result)).toEqual([]);
  });

  it("Should return empty if there is only a head and it is the value", () => {
    const lst = arrayToList([1]);
    const result = deleteLast(lst, 1);

    expect(listToArray(result)).toEqual([]);
  });

  it("Should return same list if value given is not in list", () => {
    const lst = arrayToList([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const result = deleteLast(lst, 11);

    expect(listToArray(result)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("Should handle if an element appears multiple times consecutively", () => {
    const lst = arrayToList([1, 2, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const result = deleteLast(lst, 2);

    expect(listToArray(result)).toEqual([1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("Should handle a list with the element being both the first and last", () => {
    const lst = arrayToList([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1]);
    const result = deleteLast(lst, 1);

    expect(listToArray(result)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  // Tests for deleteLast go here
});

describe("squashList", () => {
  it("Return a list of numbers where each element that is a list is replaced by the sum of its elements.", () => {
    const lst = arrayToList([1, 2, arrayToList([3, 4]), 5, arrayToList([6, 7, 8]), 9]);
    const result = squashList(lst);

    expect(listToArray(result)).toEqual([1, 2, 7, 5, 21, 9]);
  });
  // Tests for squashList go here

  it("Should return a list of only numbers if the input list is a list of numbers", () => {
    const lst = arrayToList([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const result = squashList(lst);

    expect(listToArray(result)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("Should return an empty list if the input list is empty", () => {
    const lst = arrayToList([]);
    const result = squashList(lst);

    expect(listToArray(result)).toEqual([]);
  });

  it("Should handle a list with only lists", () => {
    const lst = arrayToList([arrayToList([1, 2, 3]), arrayToList([4, 5, 6]), arrayToList([7, 8, 9])]);
    const result = squashList(lst);

    expect(listToArray(result)).toEqual([6, 15, 24]);
  });

  it("Should handle a list with only empty lists", () => {
    const lst = arrayToList([arrayToList([]), arrayToList([]), arrayToList([])]);
    const result = squashList(lst);

    expect(listToArray(result)).toEqual([0, 0, 0]);
  });
});
