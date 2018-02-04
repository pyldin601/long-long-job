// @flow
import type { TaskUnit, TaskAction } from './types';
import Label from './Label';

type GroupedTaskUnits<S> = {|
  labels: { [id: string]: number },
  tasks: TaskAction<S>[],
|};

export function groupTaskUnits<S>(taskUnits: TaskUnit<S>[]): GroupedTaskUnits<S> {
  const labels = {};
  const tasks = [];

  for (const taskUnit of taskUnits) {
    if (taskUnit instanceof Label) {
      labels[taskUnit.label] = tasks.length;
    } else {
      const action: TaskAction<S> = taskUnit;
      tasks.push(action);
    }
  }

  return { labels, tasks };
}
