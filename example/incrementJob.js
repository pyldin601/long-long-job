const LongLongJob = require('./LongLongJob');
const { repeat, next } = require('../dist/');

const incrementJob = new LongLongJob('increment-job', [
  async ({ value, threshold }) => value < threshold
    ? repeat({ value: value + 1, threshold })
    : next({ value, threshold }),
]);

module.exports = incrementJob;
