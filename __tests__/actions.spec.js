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
  // no test
});

describe('_calcPosition', () => {
  const { _calcPosition } = createActions();

  // prettier-ignore
  [
    [0, 5, 100, 0],
    [500, 5, 90, 0],
    [1200, 10, 45, 16]
  ].forEach(
    ([scrollTop, preloadItemCount, itemHeight, expected]) => {
      test(`${scrollTop}, ${preloadItemCount}, ${itemHeight} => ${expected}`, () => {
        const state = { _$el: { scrollTop } };
        const actual = _calcPosition({ preloadItemCount, itemHeight })(state);
        expect(actual._position).toEqual(expected);
      });
    }
  );
});
