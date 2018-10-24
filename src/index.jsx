//eslint-disable-next-line no-unused-vars
import { h } from 'hyperapp';

export function createState(customState = {}) {
  const reservedState = {
    items: [],

    // internal variable (don't change directly)
    _$el: null,
    _position: 0
  };
  Object.keys(customState).forEach((key) => {
    if (key in reservedState) {
      throw new Error(`State name '${key}' is reserved`);
    }
    reservedState[key] = customState[key];
  });
  return reservedState;
}

export function createActions(customActions = {}) {
  const reservedActions = {
    setItems: (items) => {
      if (!(items instanceof Array)) {
        throw new Error('items is not array');
      }
      return { items };
    },

    // internal function (don't call directly)
    _setContainerElement: (_$el) => ({ _$el }),
    _calcPosition: ({ preloadItemCount, itemHeight }) => (state) => {
      const _position = Math.max(
        0,
        Math.floor(state._$el.scrollTop / itemHeight) - preloadItemCount
      );
      if (state._position !== _position) {
        return { _position };
      }
    }
  };
  Object.keys(customActions).forEach((key) => {
    if (key in reservedActions) {
      throw new Error(`Action name '${key}' is reserved`);
    }
    reservedActions[key] = customActions[key];
  });
  return reservedActions;
}

export function createList(ItemView) {
  let noKeyWarn = null;
  return (props) => (state, actions) => {
    const {
      namespace, // required
      itemHeight, // required
      preloadItemCount = 10,
      onReachTop = () => {},
      onReachBottom = () => {},
      onCreate = () => {},
      onUpdate = () => {}
    } = props;

    if (!namespace) {
      throw new Error('Prop[namespace] is not specified');
    }
    if (!state[namespace]) {
      throw new Error(`Can't find namespace '${namespace}' in state`);
    }
    if (!actions[namespace]) {
      throw new Error(`Can't find namespace '${namespace}' in actions`);
    }
    if (!/^\d+(\.\d+)?$/.test(String(itemHeight))) {
      throw new Error('Prop[itemHeight] must be numeric');
    }
    if (!/^\d+$/.test(String(preloadItemCount))) {
      throw new Error('Prop[preloadItemCount] must be integer');
    }
    Object.keys(props).forEach((key) => {
      if (!/^on[A-Z]/.test(key)) return;
      if (typeof props[key] !== 'function') {
        throw new Error(`Prop[${key}] must be function`);
      }
    });

    const S = state[namespace];
    const A = actions[namespace];
    const listHeight = itemHeight * S.items.length;
    const drawTo = S._$el
      ? Math.min(
          S.items.length,
          S._position + Math.ceil(S._$el.offsetHeight / itemHeight) + preloadItemCount * 2
        )
      : 0;

    const containerView = (
      <div
        style={{
          overflow: 'auto',
          height: '100%'
        }}
        oncreate={(el) => {
          A._setContainerElement(el);
          onCreate(el);
        }}
        onupdate={() => onUpdate(S._$el)}
        onscroll={() => {
          const scrollTop = S._$el.scrollTop;
          if (scrollTop === 0) onReachTop(S._$el);
          if (scrollTop >= listHeight - S._$el.offsetHeight - 1) onReachBottom(S._$el);
          A._calcPosition({ preloadItemCount, itemHeight });
        }}>
        <div
          style={{
            position: 'relative',
            height: `${listHeight}px`
          }}>
          {S.items.slice(S._position, drawTo).map((item, i) => {
            const p = S._position + i;
            let itemView = <ItemView {...item} />;
            if (typeof itemView === 'function') {
              itemView = itemView(state, actions);
            }
            if (itemView.key == null && noKeyWarn == null) {
              noKeyWarn = true;
            }
            const itemStyle = {
              height: `${itemHeight}px`,
              position: 'absolute',
              top: `${p * itemHeight}px`
            };
            itemView.attributes.style = itemView.attributes.style || {};
            Object.keys(itemStyle).forEach((key) => {
              itemView.attributes.style[key] = itemStyle[key];
            });
            return itemView;
          })}
        </div>
      </div>
    );
    if (noKeyWarn) {
      console.warn(
        'For each item you need to set the (unique) key prop',
        'https://github.com/jorgebucaran/hyperapp#keys'
      );
      noKeyWarn = false;
    }
    return containerView;
  };
}
