import removeAllRangesForEntity from 'universal/utils/draftjs/removeAllRangesForEntity';
import getRethink from 'server/database/rethinkDriver';

const UNARCHIVE_PROJECT_THRESHOLD = ms('60d');

const unarchiveProjectsForReactivatedSoftTeamMembers = async (newSoftTeamMemberEmails) => {
  const r = getRethink();
  const unarchiveDate = new Date(Date.now() - UNARCHIVE_PROJECT_THRESHOLD);
  const archivedSoftProjects = r.table('SoftTeamMember')
    .getAll(r.args(newSoftTeamMemberEmails), {index: 'email'})
    .filter({isActive: false})('id')
    .do((softTeamMemberIds) => {
      return r.table('Project')
        .getAll(r.args(softTeamMemberIds), {index: 'assigneeId'})
        .filter((project) => r.and(
          project('createdAt').ge(unarchiveDate),
          project('tags').contains('archived'))
        )
    });

  if (archivedSoftProjects.length === 0) return [];

  const eqFn = (data) => data.value === 'archived';
  const unarchivedProjects = archivedSoftProjects.map((project) => ({
    id: project.id,
    context: removeAllRangesForEntity(project.content, 'TAG', eqFn),
    tags: project.tags.filter((tag) => tag !== 'archived')
  }));

  await r(unarchivedProjects).forEach((project) => {
    return r.table('Project').get(project('id')).replace(project);
  });
  return unarchivedProjects;
};

export default unarchiveProjectsForReactivatedSoftTeamMembers;
