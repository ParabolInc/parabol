import fromGlobalId from 'universal/utils/relay/fromGlobalId';

const fromTeamMemberId = (teamMemberId) => {
  const {id, type} = fromGlobalId(teamMemberId);
  if (type !== 'TeamMember') {
    console.warn('Using local variant of a teamMemberId')
  }
  const [userId, teamId] = id.split('::');
  return {userId, teamId};
};

export default fromTeamMemberId;