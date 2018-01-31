// @flow
import Action from './Action';

export default class Goto<S> extends Action<S> {
  label: string;

  constructor(label: string, state: S) {
    super(state);
    this.label = label;
  }
}
