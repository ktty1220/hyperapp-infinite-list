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
    _calcPosition: ({ preloadItemCount, itemHeight, customHeightPropName, items }) => (state) => {
      const scrollTop = state._$el.scrollTop;
      let realPosition = 0;
      if (!customHeightPropName) {
        realPosition = Math.floor(scrollTop / itemHeight);
      } else {
        let totalHeight = 0;
        items.some((item, i) => {
          totalHeight += customHeightPropName in item ? item[customHeightPropName] : itemHeight;
          if (totalHeight > scrollTop) {
            realPosition = i;
            return true;
          }
        });
      }
      const _position = Math.max(0, realPosition - preloadItemCount);
      if (state._position === _position) return;
      return { _position };
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
      customHeightPropName = null,
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

    const drawTo = (() => {
      if (!S._$el) return 0;
      const listOffsetHeight = S._$el.offsetHeight;
      let tmpPosition = S.items.length;
      if (!customHeightPropName) {
        tmpPosition = S._position + Math.ceil(listOffsetHeight / itemHeight) + preloadItemCount * 2;
      } else {
        let displayAreaHeight = 0;
        for (let i = S._position + preloadItemCount; i < S.items.length; i++) {
          const item = S.items[i];
          displayAreaHeight +=
            customHeightPropName in item ? item[customHeightPropName] : itemHeight;
          if (displayAreaHeight > listOffsetHeight) {
            tmpPosition = i + preloadItemCount;
            break;
          }
        }
      }
      return Math.min(S.items.length, tmpPosition);
    })();

    let drawFromMargin = 0;
    const listHeight = (() => {
      if (!customHeightPropName) {
        return itemHeight * S.items.length;
      }
      return S.items.reduce((prev, cur, idx) => {
        if (!(customHeightPropName in cur)) {
          if (idx < S._position) {
            drawFromMargin += itemHeight;
          }
          return prev + itemHeight;
        }
        if (!/^\d+(\.\d+)?$/.test(String(cur[customHeightPropName]))) {
          throw new Error(`${customHeightPropName} must be numeric`, cur);
        }
        if (idx < S._position) {
          drawFromMargin += cur[customHeightPropName];
        }
        return prev + cur[customHeightPropName];
      }, 0);
    })();

    const redraw = () => {
      const scrollTop = S._$el.scrollTop;
      if (scrollTop === 0) onReachTop(S._$el);
      if (scrollTop >= listHeight - S._$el.offsetHeight - 1) onReachBottom(S._$el);
      A._calcPosition({
        preloadItemCount,
        itemHeight,
        customHeightPropName,
        items: S.items
      });
    };

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
        onupdate={() => {
          redraw();
          onUpdate(S._$el);
        }}
        onscroll={redraw}>
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
              position: 'absolute',
              top: `${p * itemHeight}px`
            };
            let itemStyleHeight = itemHeight;
            if (customHeightPropName) {
              if (customHeightPropName in item) {
                itemStyleHeight = item[customHeightPropName];
              }
              itemStyle.top = `${drawFromMargin}px`;
              drawFromMargin += itemStyleHeight;
            }
            itemStyle.height = `${itemStyleHeight}px`;

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
