// @flow
import EventEmitter from 'events';
import type { StateService, TaskUnit, TaskState, ILongLongJob } from './types';
import { Next, Goto, Repeat, Done } from './actions';
import { groupTaskUnits } from './util';
import TransitionError from './TransitionError';

export default (stateService: StateService) => {
  async function getTaskState(id: string, initialState: any): Promise<TaskState<any>> {
    const taskState = await stateService.getState(id);
    if (taskState === null || taskState === undefined) {
      return { cursor: 0, state: initialState };
    }
    return taskState;
  }

  return class LongLongJob<In, Out> extends EventEmitter implements ILongLongJob<In, Out> {
    id: string;
    tasks: TaskUnit<any>[];
    isRunning: boolean;

    constructor(id: string, tasks: TaskUnit<any>[]) {
      super();
      this.id = id;
      this.tasks = tasks;
      this.isRunning = false;
    }

    async start(initialState: In): Promise<Out> {
      if (this.isRunning) {
        throw new Error('Already started');
      }

      this.isRunning = true;

      const { labels, tasks } = groupTaskUnits(this.tasks);

      if (await stateService.hasState(this.id)) {
        this.emit('resume');
      } else {
        this.emit('start');
      }

      let { cursor, state } = await getTaskState(this.id, initialState);

      while (tasks[cursor] !== undefined) {
        if (!this.isRunning) {
          throw new TransitionError('Job terminated');
        }

        const action = await tasks[cursor](state);

        if (action instanceof Next) {
          cursor += 1;
        } else if (action instanceof Repeat) {
          /* Blank */
        } else if (action instanceof Goto) {
          if (labels[action.label] === undefined) {
            throw new TransitionError(`Label "${action.label}" does not exist`);
          }
          cursor = labels[action.label];
        } else if (action instanceof Done) {
          state = action.state;
          cursor = tasks.length;
        } else {
          throw new TransitionError(`Task should return an action`);
        }

        state = action.state;

        await stateService.setState(this.id, { cursor, state });
      }

      this.emit('done', state);

      await stateService.clean(this.id);

      this.isRunning = false;

      return state;
    }

    terminate() {
      this.isRunning = false;
    }

  };
};