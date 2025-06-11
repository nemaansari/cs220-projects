import { List } from "../include/lists.js";

export interface MyIterator<T> {
  hasNext: () => boolean;
  next: () => T;
}

export function composeList<T>(lst: List<(n: T) => T>): (n: T) => T {
  if (lst.isEmpty()) return T => T;

  return lst.reduce(
    (acc, fn) => {
      return (x: T) => fn(acc(x));
    },
    (x: T) => x
  );
}

export function composeFunctions<T>(fns: ((x: T) => T)[]): (x: T) => T[] {
  if (fns.length === 0) return T => [T];

  return (x: T) => {
    return fns.reduce(
      (acc, fn) => {
        const result = fn(acc[acc.length - 1]);

        return [...acc, result];
      },
      [x]
    );
  };
}

export function composeBinary<T, U>(funArr: ((arg1: T, arg2: U) => T)[]): (a: U) => (x: T) => T {
  if (funArr.length === 0) return _return => T => T;

  return (a: U) => (x: T) => {
    return funArr.reduce((acc, fn) => {
      return fn(acc, a);
    }, x);
  };
}

export function enumRatios(): () => number {
  let sum = 2;
  let currentIndex = 0;

  function gcd(a: number, b: number): number {
    if (b === 0) return a;

    return gcd(b, a % b);
  }

  return () => {
    let num = 0;
    let den = 0;

    while (gcd(num, den) !== 1) {
      num = sum - 1 - currentIndex;
      den = currentIndex + 1;
      currentIndex++;

      if (currentIndex === sum) {
        sum++;
        currentIndex = 0;
      }
    }

    return num / den;
  };
}

export function cycleArr<T>(arr: T[][]): MyIterator<T> {
  const currentPosition: number[] = new Array(arr.length).fill(0) as number[];
  const exhausted: boolean[] = arr.map(subarray => subarray.length === 0);
  let exhaustedCount = exhausted.filter(Boolean).length;
  let currentIndex = 0;

  function hasNext(): boolean {
    return exhaustedCount < arr.length;
  }

  function next(): T {
    if (!hasNext()) {
      throw new Error("No more elements");
    }

    let value: T | undefined;
    let valueFound = false;

    while (!valueFound) {
      if (exhausted[currentIndex]) {
        currentIndex = (currentIndex + 1) % arr.length;
        continue;
      }

      const currentSubarray = arr[currentIndex];
      if (currentPosition[currentIndex] < currentSubarray.length) {
        value = currentSubarray[currentPosition[currentIndex]];

        if (value === undefined) {
          throw new Error("Undefined value");
        }

        currentPosition[currentIndex]++;

        if (currentPosition[currentIndex] === currentSubarray.length) {
          exhausted[currentIndex] = true;
          exhaustedCount++;
        }

        valueFound = true;
      }

      currentIndex = (currentIndex + 1) % arr.length;
    }

    return value as T;
  }

  return { hasNext, next };
}

export function dovetail<T>(lists: List<T>[]): MyIterator<T> {
  const currentLists: List<T>[] = [...lists];
  let round = 0;
  const queue: T[] = [];

  const fillQueue = () => {
    if (queue.length > 0) return;

    round++;
    let elementsAdded = 0;

    for (let i = 0; i < round && i < currentLists.length; i++) {
      if (!currentLists[i].isEmpty()) {
        queue.push(currentLists[i].head());
        currentLists[i] = currentLists[i].tail();
        elementsAdded++;
      }
    }

    if (elementsAdded === 0 && round < currentLists.length) {
      fillQueue();
    }
  };

  return {
    hasNext: () => {
      if (queue.length === 0) {
        fillQueue();
      }
      return queue.length > 0;
    },
    next: () => {
      if (queue.length === 0) {
        fillQueue();
      }

      if (queue.length === 0) {
        throw new Error("No more elements to iterate");
      }

      const element = queue.shift();

      if (element === undefined) {
        throw new Error("Undefined value");
      }
      return element;
    },
  };
}
