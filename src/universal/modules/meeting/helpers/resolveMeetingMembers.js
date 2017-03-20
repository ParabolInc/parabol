const resolveMeetingMembers = (queryData, myUserId) => {
  if (queryData !== resolveMeetingMembers.queryData) {
    resolveMeetingMembers.queryData = queryData;
    const {teamMembers, team} = queryData;
    resolveMeetingMembers.cache = [];
    for (let i = 0; i < teamMembers.length; i++) {
      const teamMember = teamMembers[i];
      const [userId] = teamMember.id.split('::');
      resolveMeetingMembers.cache[i] = {
        ...teamMember,
        isConnected: Boolean(teamMember.presence.find((p) => p.userId === userId)),
        isFacilitating: team.activeFacilitator === teamMember.id,
        isSelf: teamMember.id.startsWith(myUserId)
      };
    }
  }
  return resolveMeetingMembers.cache;
};

export default resolveMeetingMembers;
