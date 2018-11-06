import { objEach } from './utils';

export default function createState(customState = {}) {
  const reservedState = {
    items: [],

    // internal variable (don't change directly)
    _$el: null,
    _position: 0
  };
  objEach(customState, (key, value) => {
    if (key in reservedState) {
      throw new Error(`State name '${key}' is reserved`);
    }
    reservedState[key] = value;
  });

  return reservedState;
}
