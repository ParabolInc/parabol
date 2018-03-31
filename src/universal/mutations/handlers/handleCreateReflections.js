import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import addNodeToArray from 'universal/utils/relay/addNodeToArray';

const handleCreateReflection = (newNode, store) => {
  const meetingId = newNode.getValue('meetingId');
  const meeting = store.get(meetingId);
  addNodeToArray(newNode, meeting, 'reflectionGroups', 'sortOrder');
};

const handleCreateReflections = pluralizeHandler(handleCreateReflection);
export default handleCreateReflections;
