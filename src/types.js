// @flow
import type Label from './Label';
import type { Action } from './actions';

export type StateService = {
  hasState(id: string): Promise<boolean>,
  getState(id: string): Promise<any | null>,
  setState(id: string, state: any): Promise<void>,
  clean(id: string): Promise<void>,
};

export type TaskState<S> = { cursor: number, state: S };

export type TaskAction<S> = (state: S) => Promise<Action<S>>;

export type TaskUnit<S> = TaskAction<S> | Label;
