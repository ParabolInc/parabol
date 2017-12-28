export const resolveTeam = ({teamId}, args, {dataLoader}) => dataLoader.get('teams').load(teamId);

export const resolveTeamMember = ({teamMemberId, teamMember}, args, {dataLoader}) => {
  if (teamMemberId) {
    return dataLoader.get('teamMembers').load(teamMemberId);
  }
  return teamMember;
};

export const resolveNotification = ({notificationId, notification}, args, {dataLoader}) => {
  if (notificationId) {
    return dataLoader.get('notifications').load(notificationId);
  }
  return notification;
};

export const resolveSub = (type, resolver) => (source, args, context) => {
  if (type !== source.type) return null;
  return resolver(source, args, context);
};
