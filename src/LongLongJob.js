// @flow
import EventEmitter from 'events';
import type { StateService, TaskUnit, TaskState } from './types';
import { Next, Goto, Repeat } from './actions';
import { groupTaskUnits } from './util';

export default (stateService: StateService) => class LongLongJob<S> extends EventEmitter {
  id: string;
  tasks: TaskUnit<S>[];
  isRunning: boolean;

  constructor(id: string, tasks: TaskUnit<S>[]) {
    super();
    this.id = id;
    this.tasks = tasks;
    this.isRunning = false;
  }

  async start(initialState: S): Promise<S> {
    if (this.isRunning) {
      throw new Error('Already started');
    }

    const { labels, tasks } = groupTaskUnits(this.tasks);

    if (await this.hasStoredState()) {
      this.emit('continue');
    } else {
      this.emit('start');
    }

    let { cursor, state } = await this.getTaskState(initialState);

    while(tasks[cursor] !== undefined) {
      this.emit('task', cursor, state);

      const action = await tasks[cursor](state);

      if (action instanceof Next) {
        cursor += 1;
      } else if (action instanceof Repeat) {
        /* Blank */
      } else if (action instanceof Goto) {
        if (labels[action.label] === undefined) {
          throw new Error(`Label ${action.label} does not exist`);
        }
        cursor = labels[action.label];
      } else {
        throw new Error(`Task should return an action`);
      }

      state = action.state;

      await stateService.setState(this.id, { cursor, state });
    }

    this.emit('done');

    await this.clearStoredState();

    return state;
  }

  async getTaskState(initialState: S): Promise<TaskState<S>> {
    const taskState = await stateService.getState(this.id);
    if (taskState === null) {
      return { cursor: 0, state: initialState };
    }
    return taskState;
  };

  async hasStoredState(): Promise<boolean> {
    return stateService.hasState(this.id);
  }

  async clearStoredState(): Promise<void> {
    await stateService.clean(this.id);
  }
}
