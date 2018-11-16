import { h } from 'hyperapp';
import { validate, getListState } from './utils';

const redraw = (props, state, actions, list) => {
  const { onReachTop, onReachBottom } = props;
  const { _$el } = state;
  const { _calcPosition } = actions;
  const { height } = list;

  const scrollTop = _$el.scrollTop;
  if (scrollTop === 0) onReachTop(_$el);
  if (scrollTop >= height - _$el.offsetHeight - 1) onReachBottom(_$el);
  _calcPosition(props);
};

export default function createList(ItemView) {
  let noKeyWarn = null;

  return (props) => (state, actions) => {
    const P = validate(props, state, actions);
    const S = state[P.namespace];
    const A = actions[P.namespace];
    const L = getListState(S, P);

    const containerView = (
      <div
        style={{
          overflow: 'auto',
          height: '100%'
        }}
        oncreate={(el) => {
          A._setContainerElement(el);
          P.onCreate(el);
        }}
        onupdate={() => {
          redraw(P, S, A, L);
          P.onUpdate(S._$el);
        }}
        onscroll={() => redraw(P, S, A, L)}>
        <div
          style={{
            position: 'relative',
            height: `${L.height}px`
          }}>
          {S.items.slice(S._position, L.drawTo).map((item, i) => {
            const pos = S._position + i;
            let itemView = <ItemView {...item} />;
            if (typeof itemView === 'function') {
              itemView = itemView(state, actions);
            }
            if (itemView.key == null && noKeyWarn == null) {
              noKeyWarn = true;
            }

            const itemStyle = {
              position: 'absolute',
              top: `${pos * P.itemHeight}px`
            };
            let itemStyleHeight = P.itemHeight;
            const chpn = P.customHeightPropName;
            if (chpn) {
              if (chpn in item) {
                itemStyleHeight = item[chpn];
              }
              itemStyle.top = `${L.drawFromMargin}px`;
              L.drawFromMargin += itemStyleHeight;
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
