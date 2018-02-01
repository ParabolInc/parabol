import removeAllRangesForEntity from 'universal/utils/draftjs/removeAllRangesForEntity';
import getRethink from 'server/database/rethinkDriver';
import ms from 'ms';

const UNARCHIVE_PROJECT_THRESHOLD = ms('60d');

const unarchiveProjectsForReactivatedSoftTeamMembers = async (newSoftTeamMemberEmails, teamId) => {
  const r = getRethink();
  const unarchiveDate = new Date(Date.now() - UNARCHIVE_PROJECT_THRESHOLD);
  const softTeamMembers = await r.table('SoftTeamMember')
    .getAll(r.args(newSoftTeamMemberEmails), {index: 'email'})
    .filter({teamId});
  const inactiveSoftTeamMemberIds = softTeamMembers
    .filter((softTeamMember) => !softTeamMember.isActive)
    .map(({id}) => id);
  if (inactiveSoftTeamMemberIds.length === 0) return [];

  const archivedSoftProjects = await r.table('Project')
    .getAll(r.args(inactiveSoftTeamMemberIds), {index: 'assigneeId'})
    .filter((project) => r.and(
      project('createdAt').ge(unarchiveDate),
      project('tags').contains('archived'))
    );
  if (archivedSoftProjects.length === 0) return [];

  const eqFn = (data) => data.value === 'archived';
  const unarchivedProjects = archivedSoftProjects.map((project) => {
    const oldTeamMember = softTeamMembers.find((softTeamMember) => softTeamMember.id === project.assigneeId) || {};
    const newTeamMember = softTeamMembers.find((softTeamMember) => softTeamMember.isActive && softTeamMember.email === oldTeamMember.email);
    return {
      ...project,
      content: removeAllRangesForEntity(project.content, 'TAG', eqFn),
      tags: project.tags.filter((tag) => tag !== 'archived'),
      assigneeId: newTeamMember.id
    };
  });

  await r(unarchivedProjects).forEach((project) => {
    return r.table('Project').get(project('id')).replace(project);
  });
  return unarchivedProjects;
};

export default unarchiveProjectsForReactivatedSoftTeamMembers;
