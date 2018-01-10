import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import addNodeToArray from 'universal/utils/relay/addNodeToArray';

const handleAddTeam = (newNode, store, viewerId) => {
  const viewer = store.get(viewerId);
  addNodeToArray(newNode, viewer, 'teams', 'name');
};

const handleAddTeams = pluralizeHandler(handleAddTeam);
export default handleAddTeams;
