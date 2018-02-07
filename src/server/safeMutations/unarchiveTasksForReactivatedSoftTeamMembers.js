import removeAllRangesForEntity from 'universal/utils/draftjs/removeAllRangesForEntity';
import getRethink from 'server/database/rethinkDriver';
import ms from 'ms';

const UNARCHIVE_PROJECT_THRESHOLD = ms('60d');

const unarchiveTasksForReactivatedSoftTeamMembers = async (newSoftTeamMemberEmails, teamId) => {
  const r = getRethink();
  const unarchiveDate = new Date(Date.now() - UNARCHIVE_PROJECT_THRESHOLD);
  const softTeamMembers = await r.table('SoftTeamMember')
    .getAll(r.args(newSoftTeamMemberEmails), {index: 'email'})
    .filter({teamId});
  const inactiveSoftTeamMemberIds = softTeamMembers
    .filter((softTeamMember) => !softTeamMember.isActive)
    .map(({id}) => id);
  if (inactiveSoftTeamMemberIds.length === 0) return [];

  const archivedSoftTasks = await r.table('Task')
    .getAll(r.args(inactiveSoftTeamMemberIds), {index: 'assigneeId'})
    .filter((task) => r.and(
      task('createdAt').ge(unarchiveDate),
      task('tags').contains('archived'))
    );
  if (archivedSoftTasks.length === 0) return [];

  const eqFn = (data) => data.value === 'archived';
  const unarchivedTasks = archivedSoftTasks.map((task) => {
    const oldTeamMember = softTeamMembers.find((softTeamMember) => softTeamMember.id === task.assigneeId) || {};
    const newTeamMember = softTeamMembers.find((softTeamMember) => softTeamMember.isActive && softTeamMember.email === oldTeamMember.email);
    return {
      ...task,
      content: removeAllRangesForEntity(task.content, 'TAG', eqFn),
      tags: task.tags.filter((tag) => tag !== 'archived'),
      assigneeId: newTeamMember.id
    };
  });

  await r(unarchivedTasks).forEach((task) => {
    return r.table('Task').get(task('id')).replace(task);
  });
  return unarchivedTasks;
};

export default unarchiveTasksForReactivatedSoftTeamMembers;
