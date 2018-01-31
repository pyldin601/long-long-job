// @flow
export default class Action<S> {
  state: $ReadOnly<S>;

  constructor(state: S) {
    this.state = state;
  }
}
