import fromGlobalId from 'universal/utils/relay/fromGlobalId';

const getRelaySafeProjectId = (projectId) => {
  try {
    const {id: globalId} = fromGlobalId(projectId);
    return globalId;
  } catch (e) {
    return projectId;
  }
};
export default getRelaySafeProjectId;
