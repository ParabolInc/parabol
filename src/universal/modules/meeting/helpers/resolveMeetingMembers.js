const resolveMeetingMembers = (teamMembers, teamMemberPresence, myUserId, activeFacilitator) => {
  return teamMembers.map((teamMember) => {
    const matchingTeamMember = teamMemberPresence.find(({id}) => id === teamMember.id);
    const presence = matchingTeamMember ? matchingTeamMember.presence : [];
    return {
      ...teamMember,
      isConnected: Boolean(presence.find(({userId}) => userId === teamMember.userId)),
      isFacilitating: teamMember.id === activeFacilitator,
      isSelf: teamMember.userId === myUserId
    };
  });
};

export default resolveMeetingMembers;
