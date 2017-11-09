import fromGlobalId from 'universal/utils/relay/fromGlobalId';

const resolveMeetingMembers = (teamMembers, teamMemberPresence, myUserId, activeFacilitator) => {
  return teamMembers.map((teamMember) => {
    const {id: teamMemberId} = fromGlobalId(teamMember.id);
    const matchingTeamMember = teamMemberPresence.find(({id}) => id === teamMemberId);
    const presence = matchingTeamMember ? matchingTeamMember.presence : [];
    return {
      ...teamMember,
      isConnected: Boolean(presence.find(({userId}) => userId === teamMember.userId)),
      isFacilitating: teamMemberId === activeFacilitator,
      isSelf: teamMember.userId === myUserId
    };
  });
};

export default resolveMeetingMembers;
