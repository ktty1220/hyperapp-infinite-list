/*eslint-env jest*/
//eslint-disable-next-line no-unused-vars
import { h, app } from 'hyperapp';
import { createState, createActions } from '../src';

describe('setItems', () => {
  let main = null;
  beforeEach(() => {
    main = app(
      {
        $list1: createState()
      },
      {
        check: (cb) => (state) => cb(state),
        $list1: createActions()
      },
      () => null
    );
  });

  test('update items to state', (done) => {
    // prettier-ignore
    const items = [
      { id: 1, name: 'foo' },
      { id: 2, name: 'bar' },
      { id: 3, name: 'baz' }
    ];
    main.$list1.setItems(items);
    main.check((state) => {
      expect(state).toEqual({
        $list1: {
          _$el: null,
          _position: 0,
          items: items
        }
      });
      done();
    });
  });

  test('clear items in state', (done) => {
    main.$list1.setItems([]);
    main.check((state) => {
      expect(state).toEqual({
        $list1: {
          _$el: null,
          _position: 0,
          items: []
        }
      });
      done();
    });
  });

  test('not array => throw', () => {
    expect(() => {
      main.$list1.setItems({ id: 1, name: 'foo' });
    }).toThrowError(/is not array/);
  });
});

describe('_setContainerElement', () => {
  const { _setContainerElement } = createActions();
  test('set', () => {
    const expected = {
      offsetHeight: 1000
    };
    const actual = _setContainerElement(expected);
    expect(actual._$el).toEqual(expected);
  });
});

describe('_calcPosition', () => {
  const { _calcPosition } = createActions();

  // prettier-ignore
  [
    [0, 5, 100, 0, 0],
    [500, 5, 90, 0, 0],
    [1200, 10, 45, 16, 1],
    [18315, 4, 130, 136, 105]
  ].forEach(
    ([scrollTop, preloadItemCount, itemHeight, expected, expectedCustom]) => {
      const title = `${scrollTop}, ${preloadItemCount}, ${itemHeight} => ${expected}`;
      test(title, () => {
        const state = {
          _$el: { scrollTop },
          items: []
        };
        const actual = _calcPosition({
          preloadItemCount,
          itemHeight
        })(state);
        expect(actual._position).toEqual(expected);
      });

      test(`${title} (customHeight)`, () => {
        const state = {
          _$el: { scrollTop },
          items: [ ...Array(300).keys() ].map((n, i) => {
            const item = {
              id: i,
              name: `foo ${i}`
            };
            if (i % 4 === 2) item._height = i;        // 2, 6, 10, 14, ...
            if (i % 4 === 3) item._height = 300 + i;  // 3, 7, 11, 15, ...
            return item;
          })
        };
        const actual = _calcPosition({
          preloadItemCount,
          itemHeight,
          customHeightPropName: '_height'
        })(state);
        expect(actual._position).toEqual(expectedCustom);
      });
    }
  );

  test('_position not changed => skip update', () => {
    const state = {
      _$el: { scrollTop: 900 },
      items: [],
      _position: 6
    };
    const actual = _calcPosition({
      preloadItemCount: 3,
      itemHeight: 100
    })(state);
    expect(actual).toBeUndefined();
  });
});
