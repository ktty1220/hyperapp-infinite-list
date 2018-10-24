import { h, app, View, Component, ActionResult, ActionsType } from 'hyperapp';
import {
  InfiniteListState,
  createState,
  InfiniteListActions,
  createActions,
  InfiniteListProps,
  createList
} from '../';

// state
interface ListItem {
  id: number;
  name: string;
}

interface CustomState {
  selected: number;
}

type List1State = InfiniteListState<ListItem>;
type List2State = InfiniteListState<ListItem, CustomState>;

interface State {
  message: string;
  $list1: List1State;
  $list2: List2State;
}

const globalState: State = {
  message: 'hello',
  $list1: createState(),
  $list2: createState({
    selected: 0
  })
};

// actions
interface CustomActions {
  selectItem(id: number): ActionResult<List2State>;
  removeItem(): (state: List2State) => ActionResult<List2State>;
}

type List1Actions = InfiniteListActions<ListItem>;
type List2Actions = InfiniteListActions<ListItem, CustomState, CustomActions>;

interface Actions {
  setMessage(message: string): ActionResult<State>;
  popItem(): ActionResult<State>;
  $list1: List1Actions;
  $list2: List2Actions;
}

const globalActions: ActionsType<State, Actions> = {
  setMessage: (message) => ({ message }),
  popItem: () => (state, actions) => {
    const items = state.$list1.items;
    items.pop();
    actions.$list1.setItems(items);
  },
  $list1: createActions(),
  $list2: createActions({
    selectItem: (id: number) => ({ selected: id }),
    removeItem: () => (state: List2State) => ({
      items: state.items.filter((item) => item.id !== state.selected)
    })
  })
};

// view
const List1: Component<InfiniteListProps> = createList<ListItem>(({ id, name }) => (
  <div key={id}>
    <h2>{name}</h2>
  </div>
));

const List2: Component<InfiniteListProps> = createList<ListItem, State, Actions>(
  ({ id, name }) => (state, actions) => (
    <div key={id} onclick={() => actions.$list2.selectItem(id)}>
      <h2>{name}</h2>
      <p>{state.message}</p>
      <a href="#" onclick={() => actions.setMessage('hi')}>
        click
      </a>
    </div>
  )
);

const view: View<State, Actions> = (state, actions) => (
  <div>
    <h1>{state.message}</h1>
    <h2>selected: {state.$list2.selected}</h2>
    <button onclick={() => actions.setMessage('bye')}>click</button>
    <button onclick={() => actions.popItem()}>pop</button>
    <button onclick={() => actions.$list2.removeItem()}>remove</button>
    <List1
      namespace="$list1"
      itemHeight={100}
      onCreate={() => {
        actions.$list1.setItems([
          { id: 1, name: 'foo' },
          { id: 2, name: 'bar' },
          { id: 3, name: 'baz' }
        ]);
      }}
    />
    <List2 namespace="$list2" itemHeight={50} preloadItemCount={5} />
  </div>
);

// app
const main = app(globalState, globalActions, view, null);
main.$list2.setItems([
  { id: 101, name: 'hoge' },
  { id: 102, name: 'fuga' },
  { id: 103, name: 'piyo' }
]);
