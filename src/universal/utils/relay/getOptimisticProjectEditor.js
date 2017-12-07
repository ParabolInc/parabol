import createProxyRecord from 'universal/utils/relay/createProxyRecord';

const getOptimisticProjectEditor = (store, userId) => {
  const user = store.get(userId);
  const preferredName = user ? user.getValue('preferredName') : 'you';
  const optimisticDetails = {
    userId,
    preferredName
  };
  return createProxyRecord(store, 'ProjectEditorDetails', optimisticDetails);
};

export default getOptimisticProjectEditor;
