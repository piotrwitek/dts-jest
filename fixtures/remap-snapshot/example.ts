import * as R from '../ramda/dist/index';

// tslint:disable max-file-line-count comment-format

// @dts-jest
Math.abs(-1);

// @dts-jest this is not exist
Math.max(1, 2, 3);

// @dts-jest:group __
(() => {
  const greet = R.replace('{name}', R.__, 'Hello, {name}!');
  // @dts-jest:pass
  greet('Alice'); //=> 'Hello, Alice!'
})();

// @dts-jest:group add
(() => {
  // @dts-jest:pass
  R.add(2, 3); //=> 5
  // @dts-jest:pass
  R.add(7)(10); //=> 17
})();

// @dts-jest:group addIndex
(() => {
  (() => {
    const lastTwo = (val: number, idx: number, list: number[]) => list.length - idx <= 2;
    const filterIndexed = R.addIndex<number, boolean, number[], number[]>(R.filter);

    // @dts-jest:pass
    filterIndexed(lastTwo, [8, 6, 7, 5, 3, 0, 9]); //=> [0, 9]
    // @dts-jest:pass
    filterIndexed(lastTwo)([8, 6, 7, 5, 3, 0, 9]); //=> [0, 9]
  })();
  (() => {
    const plusFive = (num: number, idx: number, list: number[]) => { list[idx] = num + 5; };

    // @dts-jest:pass
    R.addIndex<number, void, number[], number[]>(R.forEach)(plusFive)([1, 2, 3]); //=> [6, 7, 8]
  })();
  (() => {
    const squareEnds = (elt: number, idx: number, list: number[]) =>
      (idx === 0 || idx === list.length - 1)
        ? elt * elt
        : elt;

    // @dts-jest:pass
    R.addIndex<number, number, number[], number[]>(R.map)(squareEnds, [8, 5, 3, 0, 9]); //=> [64, 5, 3, 0, 81]
    // @dts-jest:pass
    R.addIndex<number, number, number[], number[]>(R.map)(squareEnds)([8, 5, 3, 0, 9]); //=> [64, 5, 3, 0, 81]
  })();
  (() => {
    const reduceIndexed = R.addIndex<
      Record<string, number>, string, Record<string, number>,
      Record<string, number>,
      string[],
      Record<string, number>>(R.reduce);
    const objectify = (accObject: Record<string, number>, elem: string, idx: number, list: string[]) => {
      accObject[elem] = idx;
      return accObject;
    };

    // @dts-jest:pass
    reduceIndexed(objectify, {}, ['a', 'b', 'c']); //=> {a: 0, b: 1, c: 2}
    // @dts-jest:pass
    reduceIndexed(objectify)({}, ['a', 'b', 'c']); //=> {a: 0, b: 1, c: 2}
    // @dts-jest:pass
    reduceIndexed(objectify, {})(['a', 'b', 'c']); //=> {a: 0, b: 1, c: 2}
  })();
  (() => {
    const reduceIndexed = R.addIndex<'1', 'v2x1'>()(R.reduce<'111'>());

    // @dts-jest:pass
    reduceIndexed(
      (acc: string, val: string, idx: number) => `${acc},${idx}-${val}`,
      '',
      ['f', 'o', 'o', 'b', 'a', 'r'],
    ); //=> ',0-f,1-o,2-o,3-b,4-a,5-r'
  })();
})();

// @dts-jest:group minBy
(() => {
  function cmp(obj: { x: number }) { return obj.x; }
  const a = {x: 1};
  const b = {x: 2};
  const c = {x: 3};
  const d = {x: 'a'};
  const e = {x: 'z'};
  // @dts-jest:pass
  R.minBy(cmp, a, b); //=> {x: 1}
  // @dts-jest:pass
  R.minBy(cmp)(a, b); //=> {x: 1}
  // @dts-jest:pass
  R.minBy(cmp)(a)(c);
  // @dts-jest:fail
  R.minBy(cmp, d, e);
})();