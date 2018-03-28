import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

const handleRemoveReflection = (reflectionId, meetingId, store) => {
  const reflection = store.get(reflectionId);
  if (!reflection) return;
  const meeting = store.get(meetingId);
  safeRemoveNodeFromArray(reflectionId, meeting, 'reflections');
};

const handleRemoveReflections = pluralizeHandler(handleRemoveReflection);
export default handleRemoveReflections;
