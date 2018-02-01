import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';

const getIsSoftTeamMember = (assigneeId) => {
  return !fromTeamMemberId(assigneeId).teamId;
};

export default getIsSoftTeamMember;
