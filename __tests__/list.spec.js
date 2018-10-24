/*eslint-env jest*/
//eslint-disable-next-line no-unused-vars
import { h } from 'hyperapp';
import { renderToString } from '@hyperapp/render';
import { createState, createActions, createList } from '../src';
import cheerio from 'cheerio';

const P = (extend = {}) => ({
  namespace: '$list1',
  itemHeight: 100,
  ...extend
});

describe('error', () => {
  const List = createList(() => null);
  const dummyState = {
    ...createState(),
    _$el: { offsetHeight: 1000 }
  };
  const S = { $list1: dummyState };
  const A = { $list1: {} };

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
      expect(() =>
        <List {...P({ namespace: '$list2' })} />({ $list2: dummyState }, A)
      ).toThrowError("Can't find namespace '$list2' in actions");
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
});

describe('render items', () => {
  const List = createList(({ id, name }) => (
    <div key={id} data-id={id}>
      <h1>{name}</h1>
    </div>
  ));
  const items = [...Array(100).keys()].map((i) => ({
    id: i + 1,
    name: `name ${i + 1}`
  }));
  const A = { $list1: createActions() };
  const S = {
    message: 'hello',
    $list1: {
      ...createState(),
      _$el: { offsetHeight: 1000 }
    }
  };
  beforeEach(() => {
    S.$list1._position = 0;
    S.$list1.items = items;
  });

  // prettier-ignore
  [
    [0, 5, 20, 1],
    [0, 0, 10, 1],
    [30, 3, 16, 31],
    [90, 10, 10, 91]
  ].forEach(
    ([pos, preload, rendered, from]) => {
      test(`${pos}, ${preload} => render ${rendered} items from ${from}`, () => {
        S.$list1._position = pos;
        const $ = cheerio.load(
          renderToString(<List {...P({ preloadItemCount: preload })} />(S, A))
        );
        const actual = $('[data-id]');
        expect(actual.length).toEqual(rendered);
        expect(actual.map((i, el) => $(el).attr('data-id')).get()).toEqual(
          [ ...Array(rendered).keys() ].map((i) => String(i + from))
        );
      });
    }
  );

  test('merge styles', () => {
    S.$list1.items = [{ id: 1001, name: 'foo' }];
    const style = {
      height: '300px',
      color: '#222',
      background: '#fff',
      width: '100%'
    };
    const StyledList = createList(({ id, name }) => {
      return (
        <div key={id} data-id={id} style={style}>
          <h1>{name}</h1>
        </div>
      );
    });

    const $ = cheerio.load(renderToString(<StyledList {...P({ itemHeight: 123.45 })} />(S, A)));
    const actual = $('[data-id]');
    expect(actual.length).toEqual(1);
    expect(actual.eq(0).css()).toEqual({
      ...style,
      height: '123.45px',
      position: 'absolute',
      top: '0px'
    });
  });

  test('lazy component', () => {
    S.$list1.items = [{ id: 1002, name: 'bar' }];
    const LazyList = createList(({ id, name }) => ({ message }) => (
      <div key={id}>
        <h1>
          {message}, {name}
        </h1>
      </div>
    ));

    const $ = cheerio.load(renderToString(<LazyList {...P()} />(S, A)));
    expect($('h1').text()).toEqual('hello, bar');
  });

  test('key is not specified', () => {
    S.$list1.items = [{ id: 1003, name: 'baz' }];
    const NoKeyList = createList(({ id, name }) => (
      <div data-id={id}>
        <h1>{name}</h1>
      </div>
    ));

    const spyLog = jest.spyOn(console, 'warn');
    spyLog.mockImplementation((x) => x);
    <NoKeyList {...P()} />(S, A);
    expect(console.warn).toBeCalledWith(
      'For each item you need to set the (unique) key prop',
      'https://github.com/jorgebucaran/hyperapp#keys'
    );
  });
});
