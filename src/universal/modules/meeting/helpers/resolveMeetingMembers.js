const resolveMeetingMembers = (queryData, userId) => {
  if (queryData !== resolveMeetingMembers.queryData) {
    resolveMeetingMembers.queryData = queryData;
    const {teamMembers, team} = queryData;
    resolveMeetingMembers.cache = [];
    for (let i = 0; i < teamMembers.length; i++) {
      const teamMember = teamMembers[i];
      resolveMeetingMembers.cache[i] = {
        ...teamMember,
        isConnected: teamMember.presence.length > 0,
        isFacilitating: team.activeFacilitator === teamMember.id,
        isSelf: teamMember.id.startsWith(userId)
      };
    }
  }
  return resolveMeetingMembers.cache;
};

export default resolveMeetingMembers;
