import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import addNodeToArray from 'universal/utils/relay/addNodeToArray';

const handleAddInvitation = (newNode, store) => {
  const teamId = newNode.getValue('teamId');
  const team = store.get(teamId);
  addNodeToArray(newNode, team, 'invitations', 'createdAt');
};

const handleAddInvitations = pluralizeHandler(handleAddInvitation);
export default handleAddInvitations;
