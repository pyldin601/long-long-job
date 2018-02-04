# long-long-job

[![Build Status](https://travis-ci.org/pldin601/long-long-job.svg?branch=master)](https://travis-ci.org/pldin601/long-long-job)
[![Coverage Status](https://coveralls.io/repos/github/pldin601/long-long-job/badge.svg?branch=master)](https://coveralls.io/github/pldin601/long-long-job?branch=master)

## What?

This module ables you to create a chain of tasks (computations or actions) with ability to resume run state on restart.
Each task receives state of previous task (or initial state if it is first in chain) and must return action what to do next composed with new state.

## Example

First of all we need to define where job's state will be stored during transitions, and initialize module with it.
For example, we will store state in `Map` object. This is simplest storage, but won't preserve state during restarts.

### `LongLongJob.js`

```javascript
const { longLongJob } = require('long-long-job');

const mapBasedStorage = () => {
  const stateStore = new Map();
  return {
    async hasState(id) {
      return stateStore.has(id);
    },
    async setState(id, state) {
      stateStore.set(id, state);
    },
    async getState(id) {
      return stateStore.get(id) || null;
    },
    async clean(id) {
      stateStore.delete(id);
    },
  };
};

module.exports = longLongJob(mapBasedStorage());
```

### incrementJob.js

```javascript
const LongLongJob = require('./LongLongJob');
const { repeat, next } = require('long-long-job');

const incrementJob = new LongLongJob('increment-job', [
  async ({ value, threshold }) => value < threshold
    ? repeat({ value: value + 1, threshold })
    : next({ value, threshold }),
]);

module.exports = incrementJob;
```

### main.js

```javascript
const incrementJob = require('./incrementJob');

incrementJob.on('start', () => console.log('Job started'));
incrementJob.on('resume', () => console.log('Job resumed'));
incrementJob.on('task', (cursor, { value }) => console.log('Current value is %d', value));
incrementJob.on('done', () => console.log('Job finished'));

incrementJob
  .start({ value: 0, threshold: 1000 })
  .then(({ value }) => console.log('Task is done with value %d', value));
```
