//import { createState, createActions, createList } from '../src';
const createListMock = require('../src/list');
const redraw = createListMock.__get__('redraw');

const getConfig = (scrollTop) => {
  const config = {
    props: {
      onReachTop: () => {},
      onReachBottom: () => {}
    },
    state: {
      _$el: {
        scrollTop: scrollTop,
        offsetHeight: 1000
      }
    },
    actions: {
      _calcPosition: () => {}
    },
    list: {
      height: 5000
    }
  };

  jest.spyOn(config.props, 'onReachTop'),
    jest.spyOn(config.props, 'onReachBottom'),
    jest.spyOn(config.actions, '_calcPosition');

  return config;
};

test('scrollTop: 0 => onReachTop called', () => {
  const { props, state, actions, list } = getConfig(0);
  redraw(props, state, actions, list);
  expect(props.onReachTop).toHaveBeenCalledTimes(1);
  expect(props.onReachTop).toBeCalledWith(state._$el);
  expect(props.onReachBottom).not.toBeCalled();
  expect(actions._calcPosition).toHaveBeenCalledTimes(1);
  expect(actions._calcPosition).toBeCalledWith(props);
});

test('scrollTop: bottom => onReachBottom called', () => {
  const { props, state, actions, list } = getConfig(4000);
  redraw(props, state, actions, list);
  expect(props.onReachTop).not.toBeCalled();
  expect(props.onReachBottom).toHaveBeenCalledTimes(1);
  expect(props.onReachBottom).toBeCalledWith(state._$el);
  expect(actions._calcPosition).toHaveBeenCalledTimes(1);
  expect(actions._calcPosition).toBeCalledWith(props);
});

test('scrollTop: center => onReach event not called', () => {
  const { props, state, actions, list } = getConfig(2000);
  redraw(props, state, actions, list);
  expect(props.onReachTop).not.toBeCalled();
  expect(props.onReachBottom).not.toBeCalled();
  expect(actions._calcPosition).toBeCalledWith(props);
});
