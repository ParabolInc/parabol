import clientTempId from 'universal/utils/relay/clientTempId';

const getOptimisticTeamMember = (store, viewerId, teamId) => {
  const teamMemberId = `${viewerId}::${teamId}`;
  const currentTeamMember = store.get(teamMemberId);
  if (currentTeamMember) return currentTeamMember;
  const tempTeamMemberId = clientTempId();
  return store.create(tempTeamMemberId, 'TeamMember')
    .setValue(null, 'picture')
    .setValue('Me', 'preferredName')
    .setValue(tempTeamMemberId, 'id');
};

export default getOptimisticTeamMember;
