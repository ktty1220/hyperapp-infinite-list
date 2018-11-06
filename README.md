# Hyperapp InfiniteList

Infinite scroll list component for Hyperapp.

![demo1](https://ktty1220.github.io/hyperapp-infinite-list/images/demo1.gif)

![demo2](https://ktty1220.github.io/hyperapp-infinite-list/images/demo2.gif)
![demo3](https://ktty1220.github.io/hyperapp-infinite-list/images/demo3.gif)

## Feature

* Lightweight: The minified script size is 4kB.
* Memory friendly: Render only the area where items are displayed.

## Limitation

* Each item in the list must be the same height.
* Only single column list is supported.

## Instllation

```sh
npm install --save hyperapp-infinite-list
```

or

```sh
yarn add hyperapp-infinite-list
```

## Examples with tutorial

* [Basic](https://ktty1220.github.io/hyperapp-infinite-list/examples/basic.html)
* [With animation](https://ktty1220.github.io/hyperapp-infinite-list/examples/with-animation.html)
* [Auto loading when reaching the bottom of the list](https://ktty1220.github.io/hyperapp-infinite-list/examples/bottom-auto-loading.html)

## Infinite list component props

### namespace

* `required`
* `string`

Specify the [namespace](https://github.com/jorgebucaran/hyperapp#nested-actions) stored by `createState` and `createActions`.

```js
const state = {
  $list1: createState()
};

const actions = {
  $list1: createState()
};

const List = createList(() => ...);

const view = (state, actions) => {
  <div>
    <List namespace="$list1" ... />
  </div>
};
```

### itemHeight

* `required`
* `numeric`

Specify the height of each item to be rendered (px).

```js
// good: numeric (as 100px)
<List itemHeight={100} ... />

// good: numeric string (as 100px)
<List itemHeight="100" ... />

// bad: is not numeric
<List itemHeight="100px" ... />

// bad: < 0
<List itemHeight={-100} ... />
```

### preloadItemCount

* `optional` (default: `10`)
* `integer`

Specify the number of items to preload in above and below the out of the inifinite list display area.

```js
// good: integer
<List preloadItemCount={5} ... />

// good: integer string
<List itemHeight="5" ... />

// bad: is not integer
<List itemHeight={5.5} ... />

// bad: < 0
<List itemHeight={-5} ... />
```

### onReachTop

* `optional` (default: `empty function`)
* `function`

Specify the function to be called when scrolling to the top of the infinite list.

```js
<List onReachTop={(listElement) => { ...  }} ... />
```

### onReachBottom

* `optional` (default: `empty function`)
* `function`

Specify the function to be called when scrolling to the bottom of the infinite list.

```js
<List onReachBottom={(listElement) => { ...  }} ... />
```

### onCreate

* `optional` (default: `empty function`)
* `function`

Specify the function to be called when the inifinite list created.

```js
<List onCreate={(listElement) => { ...  }} ... />
```

### onUpdate

* `optional` (default: `empty function`)
* `function`

Specify the function to be called when the inifinite list updated.

```js
<List onUpdate={(listElement) => { ...  }} ... />
```

## Tips

### Multiple infinite list in the single view

```js
const state = {
  $list1: createState(),
  $list2: createState()
};

const actions = {
  $list1: createState(),
  $list2: createState()
};

const List1 = createList(() => ...);
const List2 = createList(() => ...);

const view = (state, actions) => {
  <div>
    <List1 namespace="$list1" ... />
    <List2 namespace="$list2" ... />
  </div>
};
```

### Custom state

You can extend the infinite list state by passing custom state as an argument when calling `createState()`.

```js
const state = {
  // inject the 'selected' state to $list1 namespace
  $list1: createState({
    selected: ''
  })
};

// access the 'selected' state in $list1
const view = (state, actions) => (
  <div>
    <p>selected: {state.$list1.selected}</p>
    <div>
      <List ... />
    </div>
  </div>
);
```

### Custom actions

You can extend the infinite list actions by passing custom actions as an argument when calling `createActions()`.

```js
const state = {
  // inject 'selected' state to $list1 namespace
  $list1: createState({
    selected: ''
  })
};

const actions = {
  // inject the 'selectItem' action to $list1 namespace
  $list1: createActions({
    selectItem: (id) => ({ selected: id });
  })
};

// call the 'selectItem' action in $list1
const List = createList(({ id, name }) => (state, actions) => (
  <div>
    <a href="#" onclick={() => actions.$list1.selectItem(id)}>{name}</a>
  </div>
));

// access the 'selected' state in $list1
const view = (state, actions) => (
  <div>
    <p>selected: {state.$list1.selected}</p>
    <div>
      <List ... />
    </div>
  </div>
);
```

### Manage items example

```js
// set custom actions
const actions = {
  $list1: createAction({
    addItem: (newItem) => (state, actions) => {
      const items = state.items;
      items.push(newItem);
      return { items };
    },
    removeItem: (id) => (state, actions) => ({
      items: state.items.filter((item) => item.id !== id)
    }),
    updateItem: (updateItem) => (state, actions) => ({
      items: state.items.map((item) => (item.id === updateItem.id) ? updateItem : item)
    }),
    clearItems: () => ({
      items: []
    })
  });
};

// call custom actions in view
const view = (state, actions) => (
  <div>
    <a href="#" onclick={() => actions.$list1.addItem({ id: 999, name: 'xxx' })}>add</a>
    <a href="#" onclick={() => actions.$list1.removeItem(999)}>remove</a>
    <a href="#" onclick={() => actions.$list1.updateItem({ id: 999, name: 'yyy' })}>update</a>
    <a href="#" onclick={() => actions.$list1.clearItems()}>clear</a>
  </div>
);
```

### How to use from TypeScript

see [here](https://github.com/ktty1220/hyperapp-infinite-list/blob/master/__tests__/check.tsx).

## License

[MIT license](http://www.opensource.org/licenses/mit-license)

&copy; 2018 [ktty1220](mailto:ktty1220@gmail.com)
