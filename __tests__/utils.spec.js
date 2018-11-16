import { getDrawToPosition, getListState } from '../src/utils';

const dummyItems = (n) =>
  [...Array(n).keys()].map((i) => ({
    id: i + 1,
    name: `foo ${i + 1}`
  }));

const S = (n) => ({
  _$el: { offsetHeight: 1000 },
  _position: 4,
  items: dummyItems(n)
});

const P = (extend = {}) => ({
  itemHeight: 150,
  preloadItemCount: 3,
  ...extend
});

const setCustomHeight = (state) => {
  state.items = state.items.map((item, i) => {
    if (i % 4 === 2) item._height = i; // 2, 6, 10, 14, ...
    if (i % 4 === 3) item._height = 300 + i; // 3, 7, 11, 15, ...
    return item;
  });
  return state;
};

describe('getDrawToPosition', () => {
  test('element is not assinged => 0', () => {
    const actual = getDrawToPosition({ _$el: null }, P());
    expect(actual).toEqual(0);
  });

  describe('customHeightPropName prop is not specified', () => {
    test('draw until the end of the items', () => {
      const n = 16;
      const actual = getDrawToPosition(S(n), P());
      expect(actual).toEqual(n);
    });

    test('draws only the display area and preload', () => {
      const n = 18;
      const actual = getDrawToPosition(S(n), P());
      expect(actual).toEqual(n - 1);
    });
  });

  describe('customHeightPropName prop specified', () => {
    test('draw until the end of the items', () => {
      const n = 14;
      const state = setCustomHeight(S(n));
      const actual = getDrawToPosition(
        state,
        P({
          customHeightPropName: '_height'
        })
      );
      expect(actual).toEqual(n);
    });

    test('draws only the display area and preload', () => {
      const n = 16;
      const state = setCustomHeight(S(n));
      const actual = getDrawToPosition(
        state,
        P({
          customHeightPropName: '_height'
        })
      );
      expect(actual).toEqual(n - 1);
    });
  });
});

describe('getListState', () => {
  test('customHeightPropName prop is not specified', () => {
    const n = 18;
    const props = P();
    const actual = getListState(S(n), props);
    expect(actual).toEqual({
      height: n * props.itemHeight,
      drawFromMargin: 0,
      drawTo: n - 1
    });
  });

  describe('customHeightPropName prop specified', () => {
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
    ].forEach(([ title, itemHeight, ok ], i) => {
      test(`${title} => ${ok ? 'ok' : 'throw'}`, () => {
        const n = 18;
        const state = S(n);
        state.items[i]._height = itemHeight;
        const t = expect(() => getListState(state, P({
          customHeightPropName: '_height'
        })));
        if (ok) {
          t.not.toThrow();
        } else {
          t.toThrowError('_height must be numeric');
        }
      });
    });

    test('calculated using the customHeightPropName prop', () => {
      const n = 14;
      const state = setCustomHeight(S(n));
      const actual = getListState(
        state,
        P({
          customHeightPropName: '_height'
        })
      );
      expect(actual).toEqual({
        height: 2139,
        drawFromMargin: 605,
        drawTo: n
      });
    });
  });
});
