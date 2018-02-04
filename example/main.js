const incrementJob = require('./incrementJob');

incrementJob.on('start', () => console.log('Job started'));
incrementJob.on('resume', () => console.log('Job resumed'));
incrementJob.on('task', (cursor, { value }) => console.log('Current value is %d', value));
incrementJob.on('done', () => console.log('Job finished'));

incrementJob
  .start({ value: 0, threshold: 1000 })
  .then(({ value }) => console.log('Task is done with value %d', value));
