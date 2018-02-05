// @flow
import factory from '../src/LongLongJob';
import { next, repeat, goto, label } from '../src';

const stateStore = new Map();

const LongLongJob = factory({
  async hasState(id): Promise<boolean> {
    return stateStore.has(id);
  },
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

describe('Runner tests', () => {
  test('Empty tasks chain', async () => {
    const job = new LongLongJob('test-job-1', []);
    const initialState = { foo: 'bar' };
    const result = await job.start(initialState);
    expect(result).toEqual(initialState);
  });

  test('Simple tasks chain (full)', async () => {
    const job = new LongLongJob('test-job-2', [
      async state => next(state + 10),
      async state => next(state * 2),
    ]);
    const initialState = 5;
    expect(await job.start(initialState)).toEqual(30);
  });

  test('Simple tasks chain (resume)', async () => {
    stateStore.set('test-job-3', { cursor: 1, state: 15 });
    const job = new LongLongJob('test-job-3', [
      async state => next(state + 10),
      async state => next(state * 2),
    ]);
    const initialState = 5;
    expect(await job.start(initialState)).toEqual(30);
  });

  test('Tasks chain with repeat', async () => {
    const job = new LongLongJob('test-job-4', [
      async state => next(state + 10),
      async state => (state < 1000 ? repeat(state * 2) : next(state)),
    ]);
    const initialState = 5;
    expect(await job.start(initialState)).toEqual(1920);
  });

  test('Tasks chain with label', async () => {
    const job = new LongLongJob('test-job-5', [
      label('begin'),
      async state => next(state + 10),
      async state => (state < 1000 ? goto('begin', state * 2) : next(state)),
    ]);
    const initialState = 5;
    expect(await job.start(initialState)).toEqual(1590);
  });

  test('Test event emitter (start)', async () => {
    const onStart = jest.fn();
    const onResume = jest.fn();
    const onDone = jest.fn();

    const job = new LongLongJob('test-job-6', [
      async state => next(state + 10),
      async state => next(state * 2),
    ]);
    const initialState = 5;

    job.on('start', onStart);
    job.on('resume', onResume);
    job.on('done', onDone);

    expect(await job.start(initialState)).toEqual(30);

    expect(onStart.mock.calls.length).toBe(1);
    expect(onStart.mock.calls[0]).toEqual([]);

    expect(onResume.mock.calls.length).toBe(0);

    expect(onDone.mock.calls.length).toBe(1);
    expect(onDone.mock.calls[0]).toEqual([30]);
  });

  test('Test event emitter (resume)', async () => {
    stateStore.set('test-job-7', { cursor: 1, state: 15 });

    const onStart = jest.fn();
    const onResume = jest.fn();
    const onDone = jest.fn();

    const job = new LongLongJob('test-job-7', [
      async state => next(state + 10),
      async state => next(state * 2),
    ]);
    const initialState = 5;

    job.on('start', onStart);
    job.on('resume', onResume);
    job.on('done', onDone);

    expect(await job.start(initialState)).toEqual(30);

    expect(onStart.mock.calls.length).toBe(0);

    expect(onResume.mock.calls.length).toBe(1);
    expect(onResume.mock.calls[0]).toEqual([]);

    expect(onDone.mock.calls.length).toBe(1);
    expect(onDone.mock.calls[0]).toEqual([30]);
  });

  test('Test termination', async () => {
    const job = new LongLongJob('inc-dec', [
      async ({ initial }) => goto('inc', { current: initial, threshold: initial + 10 }),

      label('inc'),
      async ({ current, threshold }) => {
        job.emit('tick', current);
        return current < threshold
          ? repeat({ current: current + 1, threshold })
          : goto('dec', { current, threshold: current - 8 });
      },

      label('dec'),
      async ({ current, threshold }) =>
        current > threshold
          ? repeat({ current: current - 1, threshold })
          : goto('inc', { current, threshold: current + 12 }),
    ]);

    job.on('tick', (current) => {
      if (current > 50) {
        job.terminate();
      }
    });

    await expect(job.start({ initial: 0 })).rejects.toEqual(new Error('Job terminated'));
  });
});
