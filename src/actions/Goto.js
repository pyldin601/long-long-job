// @flow
import Action from './Action';

export default class Goto extends Action {
  label: string;

  constructor(label: string, state: any) {
    super(state);
    this.label = label;
  }
}
