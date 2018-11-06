/*eslint-env jest*/
//eslint-disable-next-line no-unused-vars
import { h } from 'hyperapp';
import { createState, createList } from '../src';

const P = (extend = {}) => ({
  namespace: '$list1',
  itemHeight: 100,
  ...extend
});

const List = createList(() => null);
const dummyState = {
  ...createState(),
  _$el: { offsetHeight: 1000 }
};
const S = { $list1: dummyState };
const A = { $list1: {} };

test('unknow prop => throw', () => {
  expect(() => <List {...P({ foo: 1 })} />({ $list2: dummyState }, A)).toThrowError(
    "Unknown prop 'foo'"
  );
});

describe('namespace', () => {
  test('not set => throw', () => {
    expect(() => <List itemHeight={100} />()).toThrowError('Prop[namespace] is not specified');
  });

  test('not exists in state => throw', () => {
    expect(() => <List {...P()} />({ $list2: dummyState }, A)).toThrowError(
      "Can't find namespace '$list1' in state"
    );
  });

  test('not exists in actions => throw', () => {
    expect(() => <List {...P({ namespace: '$list2' })} />({ $list2: dummyState }, A)).toThrowError(
      "Can't find namespace '$list2' in actions"
    );
  });
});

describe('itemHeight', () => {
  test('not set => throw', () => {
    expect(() => <List namespace="$list1" />(S, A)).toThrowError(
      'Prop[itemHeight] must be numeric'
    );
  });

  // prettier-ignore
  [
    [ 'not numeric', '200px', false ],
    [ 'numeric string', '200', true ],
    [ 'integer', 200, true ],
    [ 'valid float', 123.456, true ],
    [ 'invalid float (multiple point)', '123.45.6', false ],
    [ 'invalid float (point start)', '.123456', false ],
    [ 'invalid float (point end)', '123456.', false ],
    [ 'zero', 0, true ],
    [ '< 0', -3, false ]
  ].forEach(([ title, itemHeight, ok ]) => {
    test(`${title} => ${ok ? 'ok' : 'throw'}`, () => {
      const t = expect(() => <List {...P({ itemHeight })} />(S, A));
      if (ok) {
        t.not.toThrow();
      } else {
        t.toThrowError('Prop[itemHeight] must be numeric');
      }
    });
  });
});

describe('preloadItemCount', () => {
  test('not set => ok', () => {
    expect(() => <List {...P()} />(S, A)).not.toThrow();
  });

  // prettier-ignore
  [
    [ 'not integer', '10px', false ],
    [ 'integer string', '10', true ],
    [ 'integer', 5, true ],
    [ 'float', 123.456, false ],
    [ 'zero', 0, true ],
    [ '< 0', -3, false ]
  ].forEach(([ title, preloadItemCount, ok ]) => {
    test(`${title} => ${ok ? 'ok' : 'throw'}`, () => {
      const t = expect(() => <List {...P({ preloadItemCount })} />(S, A));
      if (ok) {
        t.not.toThrow();
      } else {
        t.toThrowError('Prop[preloadItemCount] must be integer');
      }
    });
  });
});

// prettier-ignore
[
  'ReachTop',
  'ReachBottom',
  'Create',
  'Update',
].forEach((event) => {
  const on = `on${event}`;
  describe(on, () => {
    test('function => ok', () => {
      expect(() => <List {...P({ [on]: console.log })} />(S, A))
      .not.toThrow();
    });

    test('fnot function => throw', () => {
      expect(() => <List {...P({ [on]: 'console.log' })} />(S, A))
      .toThrowError(`Prop[${on}] must be function`);
    });
  });
});
