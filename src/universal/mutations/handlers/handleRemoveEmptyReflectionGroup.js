import handleRemoveReflectionGroups from 'universal/mutations/handlers/handleRemoveReflectionGroups';

const handleRemoveEmptyReflectionGroup = (reflectionGroupId, store) => {
  const reflectionGroup = store.get(reflectionGroupId);
  if (!reflectionGroup) return;
  const reflections = reflectionGroup.getLinkedRecords('reflections');
  if (reflections.length > 0) return;
  const meetingId = reflectionGroup.getValue('meetingId');
  handleRemoveReflectionGroups(reflectionGroupId, meetingId, store);
};

export default handleRemoveEmptyReflectionGroup;
