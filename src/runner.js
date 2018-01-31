// @flow
import { Action, Next, Goto, Repeat } from './actions';
import Label from './Label';

type StateService = {
  getState<S>(id: string): Promise<S | null>,
  setState<S>(id: string, state: S): Promise<void>,
  clean(id: string): Promise<void>,
};

type TaskAction<S> = (state: S) => Promise<Action<S>>;
type TaskUnit<S> = Label | TaskAction<S>;
type TaskState<S> = {| cursor: number, state: S |};

type TaskUnitsResult<S> = {| labels: { [string]: number }, tasks: TaskAction<S>[] |};

function groupTaskUnits<S>(taskUnits: TaskUnit<S>[]): TaskUnitsResult<S> {
  const labels = {};
  const tasks = [];

  for (const taskUnit of taskUnits) {
    if (taskUnit instanceof Label) {
      labels[taskUnit.label] = tasks.length;
    } else {
      tasks.push(taskUnit);
    }
  }

  return { labels, tasks };
}

type Runner<S> = (
  id: string,
  getInitialState: () => Promise<S>,
  taskUnits: TaskUnit<S>[],
) => Promise<S>;

export default function(stateService: StateService): Runner {
  return async function run<S>(
    id: string,
    getInitialState: () => Promise<S>,
    taskUnits: TaskUnit<S>[],
  ): Promise<S> {
    const getTaskState = async (): Promise<TaskState<S>> => {
      const taskState = await stateService.getState(id);
      if (taskState === null) {
        const initialState = await getInitialState();
        return { cursor: 0, state: initialState };
      }
      return taskState;
    };

    const runTask = async (
      { cursor, state }: TaskState<S>,
      { labels, tasks }: TaskUnitsResult<S>,
    ) => {

      const task = tasks[cursor];

      if (task === undefined) {
        return state;
      }

      const result = await task(state);

      let nextState: TaskState<S>;
      if (result instanceof Next) {
        nextState = { cursor: cursor + 1, state: result.state };
      } else if (result instanceof Repeat) {
        nextState = { cursor, state: result.state };
      } else if (result instanceof Goto) {
        const nextCursor = labels[result.label];
        if (nextCursor === undefined) {
          throw new Error(`Label ${result.label} does not exist`);
        }
        nextState = { cursor: nextCursor, state: result.state };
      } else {
        throw new Error(`Task should return an action`);
      }

      await stateService.setState(id, nextState);

      return runTask(nextState, { labels, tasks });
    };

    const groupedTaskUnits = groupTaskUnits(taskUnits);
    const taskState = await getTaskState();

    return runTask(taskState, groupedTaskUnits);
  };
}
