import { h } from 'hyperapp';
import { renderToString } from '@hyperapp/render';
import { createState, createActions, createList } from '../src';
import cheerio from 'cheerio';

const P = (extend = {}) => ({
  namespace: '$list1',
  itemHeight: 100,
  ...extend
});

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
  ([pos, preloadItemCount, rendered, from]) => {
    const title = `${pos}, ${preloadItemCount} => render ${rendered} items from ${from}`;
    test(title, () => {
      S.$list1._position = pos;
      const $ = cheerio.load(
        renderToString(<List {...P({ preloadItemCount })} />(S, A))
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
