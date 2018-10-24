import { Component, ActionsType, ActionResult } from 'hyperapp';
export as namespace hyperappInfiniteList;

// createState
export type InfiniteListState<ListItem, CustomState = {}> = {
  items: ListItem[];
} & CustomState;

export function createState<ListItem, CustomState>(
  customState?: CustomState
): InfiniteListState<ListItem, CustomState>;

// createActions
export type InfiniteListActions<ListItem, CustomState = {}, CustomActions = {}> = {
  setItems(items: ListItem[]): ActionResult<InfiniteListState<ListItem, CustomState>>;
} & CustomActions;

export function createActions<ListItem, CustomState = {}, CustomActions = {}>(
  customActions?: CustomActions
): ActionsType<
  InfiniteListState<ListItem, CustomState>,
  InfiniteListActions<ListItem, CustomState, CustomActions>
>;

// createList
export interface InfiniteListProps {
  namespace: string;
  itemHeight: number;
  preloadItemCount?: number;
  onReachTop?(): void;
  onReachBottom?(): void;
  onCreate?(): void;
  onUpdate?(): void;
}

export function createList<ListItem, State = {}, Actions = {}>(
  view: Component<ListItem, State, Actions>
): Component<InfiniteListProps>;
