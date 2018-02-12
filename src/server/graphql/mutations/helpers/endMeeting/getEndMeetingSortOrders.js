import getRethink from 'server/database/rethinkDriver';

// give the new tasks a new sort order
export default async function getEndMeetingSortOrders(completedMeeting) {
  const {tasks, invitees} = completedMeeting;
  const r = getRethink();
  const teamMemberIds = invitees.map(({id}) => id);
  const userIds = teamMemberIds.map((teamMemberId) => teamMemberId.split('::')[0]);
  const taskMax = await r.table('Task')
    .getAll(r.args(userIds), {index: 'userId'})
    .filter((task) => task('tags').contains('archived').not())
    .max('sortOrder')('sortOrder')
    .default(0);
  return tasks.map((task, idx) => ({
    id: task.id.substr(task.id.indexOf('::') + 2),
    sortOrder: taskMax + idx + 1
  }));
}
