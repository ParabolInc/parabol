export default {
  action: ['id', 'agendaId', 'createdBy', 'teamMemberId', 'userId'],
  agendaItem: ['id', 'createdBy', 'teamId', 'teamMemberId'],
  meeting: [
    'id',
    'actions.id',
    'actions.teamMemberId',
    'facilitator',
    'invitees.id',
    'invitees.actions.id',
    'invitees.actions.teamMemberId',
    'invitees.projects.id',
    'invitees.projects.teamMemberId',
    'projects.id',
    'projects.teamMemberId',
    'teamId'
  ],
  notification: ['id', 'orgId', 'userIds'],
  organization: ['id', 'stripeId', 'stripeSubscriptionId', 'orgUsers.id'],
  project: ['id', 'agendaId', 'createdBy', 'teamId', 'teamMemberId', 'userId'],
  projectHistory: ['id', 'projectId', 'teamMemberId'],
  team: ['id', 'activeFacilitator', 'meetingId', 'orgId'],
  teamMember: ['id', 'checkInOrder', 'teamId', 'userId'],
  user: ['id', 'tms', 'trialOrg', 'userOrgs.id']
};
