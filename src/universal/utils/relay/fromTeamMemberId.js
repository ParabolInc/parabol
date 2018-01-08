const fromTeamMemberId = (teamMemberId) => {
  const [userId, teamId] = teamMemberId.split('::');
  return {userId, teamId};
};

export default fromTeamMemberId;
