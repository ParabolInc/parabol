import getRethink from 'server/database/rethinkDriver';

// give the new projects a new sort order
export default async function getEndMeetingSortOrders(completedMeeting) {
  const {projects, invitees} = completedMeeting;
  const r = getRethink();
  const teamMemberIds = invitees.map(({id}) => id);
  const userIds = teamMemberIds.map((teamMemberId) => teamMemberId.split('::')[0]);
  const projectMax = await r.table('Project')
    .getAll(r.args(userIds), {index: 'userId'})
    .filter((project) => project('tags').contains('#archived').not())
    .max('sortOrder')('sortOrder')
    .default(0)
  return projects.map((project, idx) => ({
    id: project.id.substr(project.id.indexOf('::') + 2),
    sortOrder: projectMax + idx + 1
  }));
}
