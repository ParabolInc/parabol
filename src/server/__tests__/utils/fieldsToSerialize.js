export default {
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
  invitation: ['id', 'email', 'invitedBy', 'teamId'],
  invoice: ['id', 'lines.id', 'lines.details.id', 'lines.details.parentId', 'orgId'],
  invoiceItemHook: ['id', 'stripeSubscriptionId', 'userId'],
  notification: ['id', 'inviteeEmail', 'inviterUserId', 'orgId', 'requestorId', 'teamId', 'userIds'],
  organization: ['id', 'stripeId', 'stripeSubscriptionId', 'orgUsers.id'],
  orgApproval: ['id', 'approvedBy', 'deniedBy', 'email', 'orgId', 'teamId'],
  project: ['id', 'agendaId', 'createdBy', 'teamId', 'teamMemberId', 'userId'],
  projectHistory: ['id', 'projectId', 'teamMemberId'],
  team: ['id', 'activeFacilitator', 'meetingId', 'orgId'],
  teamMember: ['id', 'checkInOrder', 'teamId', 'userId'],
  user: ['id', 'tms', 'userOrgs.id']
};
