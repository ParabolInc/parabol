import fromGlobalId from 'universal/utils/relay/fromGlobalId';
import toGlobalId from 'universal/utils/relay/toGlobalId';

const toTeamMemberId = (teamId, userId) => {
  let {id: localTeamId, type: teamType} = fromGlobalId(teamId);
  let {id: localUserId, type: userType} = fromGlobalId(userId);
  if (teamType !== 'Team') {
    console.warn('Not using global teamId');
    localTeamId = teamId;
  }
  if (userType !== 'User') {
    console.warn('Not using global userId');
    localUserId = userId;
  }
  return toGlobalId('TeamMember', `${localUserId}::${localTeamId}`);
};

export default toTeamMemberId;
