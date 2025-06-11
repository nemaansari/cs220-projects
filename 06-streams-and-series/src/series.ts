import { sempty, Stream, snode } from "../include/stream.js";

export type Series = Stream<number>;

export function addSeries(s: Series, t: Series): Series {
  // TODO
  if (s.isEmpty()) return t;
  if (t.isEmpty()) return s;
  return snode(s.head() + t.head(), () => addSeries(s.tail(), t.tail()));
}

function scaleSeries(k: number, s: Series): Series {
  if (s.isEmpty()) {
    return sempty();
  }

  return snode(k * s.head(), () => scaleSeries(k, s.tail()));
}

export function prodSeries(s: Series, t: Series): Series {
  // TODO

  if (s.isEmpty()) {
    return sempty();
  }
  if (t.isEmpty()) {
    return sempty();
  }

  const a0 = s.head();
  const tHead = t.head();

  return snode(a0 * tHead, () => {
    return addSeries(scaleSeries(a0, t.tail()), prodSeries(s.tail(), t));
  });
}

export function derivSeries(s: Series): Series {
  // TODO

  function helper(s: Series, n: number): Series {
    if (s.isEmpty()) return sempty();
    return snode(s.head() * n, () => helper(s.tail(), n + 1));
  }

  return s.isEmpty() ? sempty() : helper(s.tail(), 1);
}

export function coeff(s: Series, n: number): number[] {
  // TODO

  const arr = [];
  let current = s;
  let i = 0;

  while (i <= n && !current.isEmpty()) {
    arr.push(current.head());
    current = current.tail();
    i++;
  }

  return arr;
}

export function evalSeries(s: Series, n: number): (x: number) => number {
  // TODO

  return function getSum(x: number): number {
    let sum = 0;
    let current = s;
    let i = 0;
    while (i <= n && !current.isEmpty()) {
      sum += current.head() * Math.pow(x, i);
      current = current.tail();
      i++;
    }

    return sum;
  };
}

export function applySeries(f: (c: number) => number, v: number): Series {
  // TODO

  return snode(v, () => applySeries(f, f(v)));
}

export function expSeries(): Series {
  // TODO

  function calcNext(n: number, cn: number): number {
    return (cn * 1) / (n + 1);
  }

  let position = 0;
  function calcPosition(coeff: number): number {
    const n = calcNext(position, coeff);
    position++;
    return n;
  }

  return applySeries(calcPosition, 1);
}

export function recurSeries(coef: number[], init: number[]): Series {
  // TODO
  const currValues = [...init];

  const nextValue = () => {
    let nextVal = 0;
    for (let i = 0; i < coef.length; i++) {
      nextVal += coef[i] * currValues[i];
    }
    currValues.shift();
    currValues.push(nextVal);
    return nextVal;
  };

  function buildStream(index: number): Series {
    if (index < init.length) {
      return snode(init[index], () => buildStream(index + 1));
    } else {
      const val = nextValue();
      return snode(val, () => buildStream(index));
    }
  }

  return buildStream(0);
}
