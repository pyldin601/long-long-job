// @flow
export default class Action {
  state: $ReadOnly<any>;

  constructor(state: any) {
    this.state = state;
  }
}
