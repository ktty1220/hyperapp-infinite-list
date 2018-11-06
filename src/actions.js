import { objEach } from './utils';

export default function createActions(customActions = {}) {
  const reservedActions = {
    setItems: (items) => {
      if (!(items instanceof Array)) {
        throw new Error('items is not array');
      }
      return { items };
    },

    // internal function (don't call directly)
    _setContainerElement: (_$el) => ({ _$el }),
    _calcPosition: (props) => (state) => {
      const pic = props.preloadItemCount;
      const ih = props.itemHeight;
      const chpn = props.customHeightPropName;

      const scrollTop = state._$el.scrollTop;
      let realPosition = 0;
      if (!chpn) {
        realPosition = Math.floor(scrollTop / ih);
      } else {
        let totalHeight = 0;
        state.items.some((item, i) => {
          totalHeight += chpn in item ? item[chpn] : ih;
          if (totalHeight > scrollTop) {
            realPosition = i;
            return true;
          }
        });
      }
      const _position = Math.max(0, realPosition - pic);
      if (_position === state._position) return;
      return { _position };
    }
  };

  objEach(customActions, (key, value) => {
    if (key in reservedActions) {
      throw new Error(`Action name '${key}' is reserved`);
    }
    reservedActions[key] = value;
  });

  return reservedActions;
}
