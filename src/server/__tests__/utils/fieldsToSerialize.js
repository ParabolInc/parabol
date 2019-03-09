export default {
  agendaItem: ['id', 'createdBy', 'teamId', 'teamMemberId'],
  meeting: [
    'id',
    'actions.id',
    'actions.teamMemberId',
    'facilitator',
    'invitees.id',
    'invitees.actions.id',
    'invitees.actions.assigneeId',
    'invitees.tasks.id',
    'invitees.tasks.assigneeId',
    'tasks.id',
    'tasks.assigneeId',
    'teamId'
  ],
  invoice: ['id', 'lines.id', 'lines.details.id', 'lines.details.parentId', 'orgId'],
  invoiceItemHook: ['id', 'stripeSubscriptionId', 'userId'],
  notification: [
    'id',
    'inviteeEmail',
    'inviterUserId',
    'orgId',
    'requestorId',
    'teamId',
    'userIds'
  ],
  organization: ['id', 'stripeId', 'stripeSubscriptionId', 'orgUsers.id'],
  task: ['id', 'agendaId', 'createdBy', 'teamId', 'assigneeId', 'userId'],
  taskHistory: ['id', 'taskId', 'assigneeId'],
  team: ['id', 'activeFacilitator', 'meetingId', 'orgId'],
  teamMember: ['id', 'checkInOrder', 'teamId', 'userId'],
  user: ['id', 'tms', 'userOrgs.id']
}
