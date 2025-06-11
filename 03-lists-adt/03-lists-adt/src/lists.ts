import { List, node, empty, reverseList } from "../include/lists.js";

function calculateProducts(lst: List<number>, condition: (n: number) => boolean): List<number> {
  let result = empty();
  let product = 1;

  while (!lst.isEmpty()) {
    const current = lst.head();

    if (condition(current)) {
      product *= current;
      result = node(product, result);
    } else {
      product = 1;
    }

    lst = lst.tail();
  }

  return reverseList(result as List<number>);
}

function sumList(lst: List<number>): number {
  if (lst.isEmpty()) {
    return 0;
  }
  return lst.head() + sumList(lst.tail());
}

export function insertOrdered(lst: List<number>, el: number): List<number> {
  if (lst.isEmpty() || el <= lst.head()) {
    return node(el, lst);
  }

  return node(lst.head(), insertOrdered(lst.tail(), el));
}

export function everyNRev<T>(lst: List<T>, n: number): List<T> {
  let index = 0;

  return lst.reduce((acc, current) => {
    index++;
    if (index % n === 0) {
      return node(current, acc);
    }
    return acc;
  }, empty());
}

export function everyNCond<T>(lst: List<T>, n: number, cond: (e: T) => boolean): List<T> {
  const filteredList = lst.filter(cond);
  let index = 0;

  const result = filteredList.reduce((acc, current) => {
    index++;
    if (index % n === 0) {
      return node(current, acc);
    }
    return acc;
  }, empty());

  return reverseList(result as List<T>);
}

export function keepTrendMiddles(
  lst: List<number>,
  allSatisfy: (prev: number, curr: number, next: number) => boolean
): List<number> {
  if (lst.isEmpty() || lst.tail().isEmpty()) {
    return empty();
  }

  let result = empty();
  let prev = lst.head();
  let rest = lst.tail();

  while (!rest.tail().isEmpty()) {
    const curr = rest.head();
    const next = rest.tail().head();

    if (allSatisfy(prev, curr, next)) {
      result = node(curr, result);
    }

    prev = curr;
    rest = rest.tail();
  }

  return reverseList(result as List<number>);
}

export function keepLocalMaxima(lst: List<number>): List<number> {
  return keepTrendMiddles(lst, (prev, curr, next) => curr > prev && curr > next);
}

export function keepLocalMinima(lst: List<number>): List<number> {
  return keepTrendMiddles(lst, (prev, curr, next) => curr < prev && curr < next);
}

export function keepLocalMinimaAndMaxima(lst: List<number>): List<number> {
  const localMaxima = keepTrendMiddles(lst, (prev, curr, next) => curr > prev && curr > next);
  const localMinima = keepTrendMiddles(lst, (prev, curr, next) => curr < prev && curr < next);

  let result = localMaxima;
  let current = localMinima;

  while (!current.isEmpty()) {
    result = insertOrdered(result, current.head());
    current = current.tail();
  }

  return result;
}

export function nonNegativeProducts(lst: List<number>): List<number> {
  return calculateProducts(lst, n => n >= 0);
}

export function negativeProducts(lst: List<number>): List<number> {
  return calculateProducts(lst, n => n < 0);
}

export function deleteFirst<T>(lst: List<T>, el: T): List<T> {
  if (lst.isEmpty()) {
    return empty();
  }

  if (lst.head() === el) {
    return lst.tail();
  }

  return node(lst.head(), deleteFirst(lst.tail(), el));
}

export function deleteLast<T>(lst: List<T>, el: T): List<T> {
  function helper(lst: List<T>, el: T, found: boolean): { list: List<T>; found: boolean } {
    if (lst.isEmpty()) {
      return { list: empty(), found: false };
    }

    const result = helper(lst.tail(), el, found);

    if (!result.found && lst.head() === el) {
      return { list: result.list, found: true };
    }

    return { list: node(lst.head(), result.list), found: result.found };
  }

  const result = helper(lst, el, false);

  return result.list;
}

export function squashList(lst: List<number | List<number>>): List<number> {
  if (lst.isEmpty()) {
    return empty();
  }

  if (typeof lst.head() === "number") {
    const result = node(lst.head(), squashList(lst.tail()));
    return result as List<number>;
  }

  const sum = sumList(lst.head() as List<number>);

  return node(sum, squashList(lst.tail()));
}
