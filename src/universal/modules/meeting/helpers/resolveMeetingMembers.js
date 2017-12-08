const resolveMeetingMembers = (teamMembers, teamMemberPresence, myUserId, activeFacilitator) => {
  return teamMembers.map((teamMember) => {
    const matchingTeamMember = teamMemberPresence.find(({id}) => id === teamMember.id);
    const presence = matchingTeamMember ? matchingTeamMember.presence : [];
    const isSelf = teamMember.userId === myUserId;
    return {
      ...teamMember,
      isConnected: isSelf || Boolean(presence.find(({userId}) => userId === teamMember.userId)),
      isFacilitating: teamMember.id === activeFacilitator,
      isSelf
    };
  });
};

export default resolveMeetingMembers;
