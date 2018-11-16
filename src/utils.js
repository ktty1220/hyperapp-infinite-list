export function objEach(obj, fn) {
  Object.keys(obj).forEach((key) => fn(key, obj[key]));
}

export function validate(props, state, actions) {
  const P = {
    namespace: null, // required
    itemHeight: null, // required
    preloadItemCount: 10,
    customHeightPropName: null,
    onReachTop: () => {},
    onReachBottom: () => {},
    onCreate: () => {},
    onUpdate: () => {}
  };
  objEach(props, (key, value) => {
    if (!(key in P)) {
      throw new Error(`Unknown prop '${key}'`);
    }
    P[key] = value;
  });

  if (!P.namespace) {
    throw new Error('Prop[namespace] is not specified');
  }
  if (!state[P.namespace]) {
    throw new Error(`Can't find namespace '${P.namespace}' in state`);
  }
  if (!actions[P.namespace]) {
    throw new Error(`Can't find namespace '${P.namespace}' in actions`);
  }
  if (!/^\d+(\.\d+)?$/.test(String(P.itemHeight))) {
    throw new Error('Prop[itemHeight] must be numeric');
  }
  if (!/^\d+$/.test(String(P.preloadItemCount))) {
    throw new Error('Prop[preloadItemCount] must be integer');
  }
  objEach(P, (key, value) => {
    if (!/^on[A-Z]/.test(key)) return;
    if (typeof value !== 'function') {
      throw new Error(`Prop[${key}] must be function`);
    }
  });

  return P;
}

export function getDrawToPosition(state, props) {
  const { items, _$el, _position } = state;
  const pic = props.preloadItemCount;
  const ih = props.itemHeight;
  const chpn = props.customHeightPropName;

  if (!_$el) return 0;

  const listOffsetHeight = _$el.offsetHeight;
  let tmpPosition = items.length;

  if (!chpn) {
    tmpPosition = _position + Math.ceil(listOffsetHeight / ih) + pic * 2;
  } else {
    let displayAreaHeight = 0;
    for (let i = _position + pic; i < items.length; i++) {
      const item = items[i];
      displayAreaHeight += chpn in item ? item[chpn] : ih;
      if (displayAreaHeight > listOffsetHeight) {
        tmpPosition = i + pic;
        break;
      }
    }
  }

  return Math.min(items.length, tmpPosition);
}

export function getListState(state, props) {
  const { items, _position } = state;
  const chpn = props.customHeightPropName;
  const ih = props.itemHeight;
  let drawFromMargin = 0;

  return {
    height: chpn
      ? items.reduce((prev, cur, idx) => {
          if (!(chpn in cur)) {
            if (idx < _position) {
              drawFromMargin += ih;
            }
            return prev + ih;
          }
          if (!/^\d+(\.\d+)?$/.test(String(cur[chpn]))) {
            const err = new Error(`${chpn} must be numeric`);
            err.item = cur;
            throw err;
          }
          if (idx < _position) {
            drawFromMargin += cur[chpn];
          }
          return prev + cur[chpn];
        }, 0)
      : ih * items.length,
    drawFromMargin,
    drawTo: getDrawToPosition(state, props)
  };
}
