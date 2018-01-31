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
      continue;
    }
    tasks.push(taskUnit);
  }

  return { labels, tasks };
}

export default (stateService: StateService) => async <S>(
  id: string,
  getInitialState: () => Promise<S>,
  taskUnits: TaskUnit<S>[],
): Promise<void> => {
  const getTaskState = async (): Promise<TaskState<S>> => {
    const taskState = await stateService.getState(id);
    if (taskState === null) {
      const initialState = await getInitialState();
      return { cursor: 0, state: initialState };
    }
    return taskState;
  };

  const runAll = (taskState: TaskState<S>, { labels, tasks }: TaskUnitsResult<S>) =>
    new Promise((resolve, reject) => {
      const runTask = async ({ cursor, state }: TaskState<S>) => {
        const runTask = tasks[cursor];

        if (runTask === undefined) {
          return resolve(state);
        }

        const result = await runTask(state);

        if (result instanceof Next) {
          setImmediate(runTask, { cursor: cursor + 1, state: result.state });
        } else if (result instanceof Repeat) {
          setImmediate(runTask, { cursor, state: result.state });
        } else if (result instanceof Goto) {
          const nextCursor = labels[result.label];
          if (nextCursor === undefined) {
            throw new Error(`Label ${result.label} does not exist`);
          }
          setImmediate(runTask, { cursor: nextCursor, state: result.state });
        }

        throw new Error(`Tasks should return an action`);
      };

      runTask(taskState);
    });

  const groupedTaskUnits = groupTaskUnits(taskUnits);
  const taskState = await getTaskState();

  await runAll(taskState, groupedTaskUnits);
};
