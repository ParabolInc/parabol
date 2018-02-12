import createProxyRecord from 'universal/utils/relay/createProxyRecord';

const getOptimisticTaskEditor = (store, userId, taskId, isEditing) => {
  const task = store.get(taskId);
  const user = store.get(userId) || createProxyRecord(store, 'User', {id: userId});
  const payload = createProxyRecord(store, 'EditTaskMutationPayload', {isEditing});
  return payload.setLinkedRecord(user, 'editor').setLinkedRecord(task, 'task');
};

export default getOptimisticTaskEditor;
