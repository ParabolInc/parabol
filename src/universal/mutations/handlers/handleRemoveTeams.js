import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

const handleRemoveTeam = (teamId, store, viewerId) => {
  const viewer = store.get(viewerId);
  safeRemoveNodeFromArray(teamId, viewer, 'teams');
};

const handleRemoveTeams = pluralizeHandler(handleRemoveTeam);
export default handleRemoveTeams;
