const { longLongJob } = require('../dist/');

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

const LongLongJob = longLongJob(mapBasedStorage());

module.exports = LongLongJob;
