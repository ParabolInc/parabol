export default {
  action: ['id', 'agendaId', 'createdBy', 'teamMemberId', 'userId'],
  notification: ['id', 'orgId', 'userIds'],
  organization: ['id', 'stripeId', 'stripeSubscriptionId', 'orgUsers.id'],
  project: ['id', 'agendaId', 'createdBy', 'teamId', 'teamMemberId', 'userId'],
  projectHistory: ['id', 'projectId', 'teamMemberId'],
  team: ['id', 'orgId'],
  teamMember: ['id', 'teamId', 'userId'],
  user: ['id', 'tms', 'trialOrg', 'userOrgs.id']
};
