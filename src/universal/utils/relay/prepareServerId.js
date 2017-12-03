import fromGlobalId from 'universal/utils/relay/fromGlobalId';

const prepareServerId = (maybeGlobalId) => {
  if (!maybeGlobalId) return maybeGlobalId;
  return fromGlobalId(maybeGlobalId).id;
};

export default prepareServerId;
