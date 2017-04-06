import getRethink from 'server/database/rethinkDriver';

// give the new projects and actions a new sort order
export default async function getEndMeetingSortOrders(completedMeeting) {
  const {projects, invitees} = completedMeeting;
  const r = getRethink();
  const teamMemberIds = invitees.map(({id}) => id);
  const userIds = teamMemberIds.map((teamMemberId) => teamMemberId.split('::')[0]);
  const {actionMaxes, projectMax} = await r.expr({
    actionMaxes: r.table('Action')
          .getAll(r.args(userIds), {index: 'userId'})
          .filter({isComplete: false})
          .group('userId')
          .max('sortOrder')('sortOrder')
          .ungroup(),
    projectMax: r.table('Project')
          .getAll(r.args(userIds), {index: 'userId'})
          .filter({isArchived: false})
          .max('sortOrder')('sortOrder')
          .default(0)
  });
  const actionMaxSort = actionMaxes.reduce((obj, task) => {
    const {group, reduction} = task;
    obj[group] = reduction;
    return obj;
  }, {});
  const updatedActions = [];
  invitees.forEach((invitee) => {
    const maxSort = actionMaxSort[invitee.id] || 0;
    invitee.actions.forEach((action, idx) => {
      updatedActions.push({
        id: action.id.substr(action.id.indexOf('::') + 2),
        sortOrder: maxSort + idx + 1
      });
    });
  });
  const updatedProjects = projects.map((project, idx) => ({
    id: project.id.substr(project.id.indexOf('::') + 2),
    sortOrder: projectMax + idx + 1
  }));
  return {
    updatedActions,
    updatedProjects
  };
}
