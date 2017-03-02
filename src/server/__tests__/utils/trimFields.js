export default {
  action: ['id', 'agendaId', 'teamMemberId', 'userId'],
  notification: ['id', 'orgId', 'userIds'],
  organization: ['id', 'stripeId', 'stripeSubscriptionId', 'orgUsers.id'],
  team: ['id', 'orgId'],
  teamMember: ['id', 'teamId', 'userId'],
  user: ['id', 'tms', 'trialOrg', 'userOrgs.id']
};
