const LongLongJob = require('./LongLongJob');
const { repeat, done } = require('../dist/');

const incrementJob = new LongLongJob('increment-job', [
  async ({ value, threshold }) => {
    incrementJob.emit('tick', value);
    return value < threshold 
      ? repeat({ value: value + 1, threshold })
      : done({ value, threshold });
  },
]);

module.exports = incrementJob;
