// @flow
export default class Action<S> {
  state: S;

  constructor(state: S) {
    this.state = state;
  }
}
