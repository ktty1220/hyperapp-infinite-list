import { h, app } from 'hyperapp';
import { createState, createActions } from '../src';

describe('custom state & actions in namespace', () => {
  let main = null;
  // prettier-ignore
  const items = [
    { id: 1, name: 'foo' },
    { id: 2, name: 'bar' },
    { id: 3, name: 'baz' }
  ];
  beforeEach(() => {
    main = app(
      {
        $list1: createState({
          selected: 0
        })
      },
      {
        check: (cb) => (state) => cb(state),
        $list1: createActions({
          selectItem: (id) => ({ selected: id }),
          removeItem: () => (state) => ({
            items: state.items.filter((item) => item.id !== state.selected)
          })
        })
      },
      () => null
    );
    main.$list1.setItems(items);
  });

  test('selectItem', (done) => {
    main.$list1.selectItem(2);
    main.check((state) => {
      expect(state).toEqual({
        $list1: {
          _$el: null,
          _position: 0,
          items: items,
          selected: 2
        }
      });
      done();
    });
  });

  test('removeItem', (done) => {
    main.$list1.selectItem(1);
    main.$list1.removeItem();
    main.check((state) => {
      expect(state).toEqual({
        $list1: {
          _$el: null,
          _position: 0,
          items: items.filter((item) => item.id !== 1),
          selected: 1
        }
      });
      done();
    });
  });
});

describe('reserved error', () => {
  Object.keys(createState()).forEach((key) => {
    test(`state[${key}] => throw`, () => {
      expect(() =>
        createState({
          [key]: 123
        })
      ).toThrowError(`State name '${key}' is reserved`);
    });
  });

  Object.keys(createActions()).forEach((key) => {
    test(`actions[${key}] => throw`, () => {
      expect(() =>
        createActions({
          [key]: () => {}
        })
      ).toThrowError(`Action name '${key}' is reserved`);
    });
  });
});
