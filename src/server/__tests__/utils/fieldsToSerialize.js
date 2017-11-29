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
    'invitees.tasks.id',
    'invitees.tasks.teamMemberId',
    'tasks.id',
    'tasks.teamMemberId',
    'teamId'
  ],
  invitation: ['id', 'email', 'invitedBy', 'teamId'],
  invoice: ['id', 'lines.id', 'lines.details.id', 'lines.details.parentId', 'orgId'],
  invoiceItemHook: ['id', 'stripeSubscriptionId', 'userId'],
  notification: ['id', 'inviteeEmail', 'inviterUserId', 'orgId', 'requestorId', 'teamId', 'userIds'],
  organization: ['id', 'stripeId', 'stripeSubscriptionId', 'orgUsers.id'],
  orgApproval: ['id', 'approvedBy', 'deniedBy', 'email', 'orgId', 'teamId'],
  task: ['id', 'agendaId', 'createdBy', 'teamId', 'teamMemberId', 'userId'],
  taskHistory: ['id', 'taskId', 'teamMemberId'],
  team: ['id', 'activeFacilitator', 'meetingId', 'orgId'],
  teamMember: ['id', 'checkInOrder', 'teamId', 'userId'],
  user: ['id', 'tms', 'userOrgs.id']
};
