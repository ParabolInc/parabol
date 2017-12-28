export const resolveTeam = ({teamId}, args, {dataLoader}) => dataLoader.get('teams').load(teamId);

export const resolveTeamMember = ({teamMemberId}, args, {dataLoader}) => dataLoader.get('teamMembers').load(teamMemberId);

export const resolveNotification = ({notificationId, notification}, args, {dataLoader}) => {
  if (notificationId) {
    return dataLoader.get('notifications').load(notificationId);
  }
  return notification;
};

