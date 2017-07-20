import fromGlobalId from 'universal/utils/relay/fromGlobalId';
import toGlobalId from 'universal/utils/relay/toGlobalId';

let tempId = 0;
const getOptimisticTeamMember = (store, viewerId, teamId) => {
  const globalTeamMemberId = toGlobalId('TeamMember', `${fromGlobalId(viewerId).id}::${teamId}`);
  const currentTeamMember = store.get(globalTeamMemberId);
  if (currentTeamMember) return currentTeamMember;
  const teamMemberId = `client:TeamMember:${tempId++}`;
  return store.create(teamMemberId, 'TeamMember')
    .setValue(null, 'picture')
    .setValue('Me', 'preferredName')
    .setValue(teamMemberId, 'id');
};

export default getOptimisticTeamMember;