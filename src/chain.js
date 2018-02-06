import { TaskUnit } from './types';

export default function <S> (...tasks: TaskUnit<S>[]): TaskUnit<S>[] {
  return tasks;
}
