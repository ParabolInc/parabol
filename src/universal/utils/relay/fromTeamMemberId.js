import fromGlobalId from 'universal/utils/relay/fromGlobalId';

const fromTeamMemberId = (teamMemberId) => {
  let localTeamMemberId;
  if (teamMemberId.indexOf('::') !== -1) {
    console.warn('Using local variant of a teamMemberId');
    localTeamMemberId = teamMemberId;
  } else {
    const {id, type} = fromGlobalId(teamMemberId);
    if (type !== 'TeamMember') {
      console.error('Not a valid teamMemberId');
    }
    localTeamMemberId = id;
  }
  const [userId, teamId] = localTeamMemberId.split('::');
  return {userId, teamId};
};

export default fromTeamMemberId;
