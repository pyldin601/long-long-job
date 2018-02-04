// @flow
import { Next, Repeat, Goto } from './actions';
import Label from './Label';

export function next<S>(state: S): Next<S> {
  return new Next(state);
}

export function repeat<S>(state: S): Repeat<S> {
  return new Repeat(state);
}

export function goto<S>(id: string, state: S): Goto<S> {
  return new Goto(id, state);
}

export function label(id: string): Label {
  return new Label(id);
}
