import fromGlobalId from 'universal/utils/relay/fromGlobalId';

const getRelaySafeTaskId = (taskId) => {
  try {
    const {id: globalId} = fromGlobalId(taskId);
    return globalId;
  } catch (e) {
    return taskId;
  }
};
export default getRelaySafeTaskId;
