// @flow
import createRunner from '../src/runner';
import { next, repeat, goto, label } from '../src';

describe('Runner tests', () => {
  const stateStore = new Map();
  const run = createRunner({
    async setState(id, state): Promise<void> {
      stateStore.set(id, state);
    },
    async getState(id): Promise<any> {
      return stateStore.get(id) || null;
    },
    async clean(id): Promise<void> {
      stateStore.delete(id);
    },
  });

  test('Empty tasks chain', async () => {
    const initialState = { foo: 'bar' };
    const result = await run('test-job', async () => initialState, []);
    expect(result).toEqual(initialState);
  });

  test('Simple tasks chain (full)', async () => {
    const initialState = 5;
    const result = await run('test-job', async () => initialState, [
      async (state) => next(state + 10),
      async (state) => next(state * 2),
    ]);
    expect(result).toEqual(30);
  });

  test('Simple tasks chain (resume)', async () => {
    stateStore.set('test-job', { cursor: 1, state: 15 });

    const initialState = 5;
    const result = await run('test-job', async () => initialState, [
      async (state) => next(state + 10),
      async (state) => next(state * 2),
    ]);
    expect(result).toEqual(30);
  });

  test('Tasks chain with repeat', async () => {
    stateStore.set('test-job', { cursor: 1, state: 15 });

    const initialState = 5;
    const result = await run('test-job', async () => initialState, [
      async (state) => next(state + 10),
      async (state) => (state < 1000 ? repeat(state * 2) : next(state)),
    ]);
    expect(result).toEqual(1920);
  });

  test('Tasks chain with label', async () => {
    stateStore.set('test-job', { cursor: 1, state: 15 });

    const initialState = 5;
    const result = await run('test-job', async () => initialState, [
      label('begin'),
      async (state) => next(state + 10),
      async (state) => (state < 1000 ? goto('begin', state * 2) : next(state)),
    ]);
    expect(result).toEqual(1590);
  });
});
