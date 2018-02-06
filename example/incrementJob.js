const LongLongJob = require('./LongLongJob');
const { repeat, done, chain } = require('../dist/');

const incrementJob = new LongLongJob('increment-job', chain(
  async ({ value, threshold }) => {
    incrementJob.emit('tick', value);
    return value < threshold 
      ? repeat({ value: value + 1, threshold })
      : done({ value, threshold });
  },
));

module.exports = incrementJob;
