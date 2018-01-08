import createProxyRecord from 'universal/utils/relay/createProxyRecord';

const getOptimisticProjectEditor = (store, userId, projectId, isEditing) => {
  const project = store.get(projectId);
  const user = store.get(userId) || createProxyRecord(store, 'User', {id: userId});
  const payload = createProxyRecord(store, 'EditProjectMutationPayload', {isEditing});
  return payload.setLinkedRecord(user, 'editor').setLinkedRecord(project, 'project');
};

export default getOptimisticProjectEditor;
