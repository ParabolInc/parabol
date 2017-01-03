import getRethink from 'server/database/rethinkDriver';

// give the new projects and actions a new sort order
export default async function getEndMeetingSortOrder(invitees) {
  const r = getRethink();
  const usersWithProjects = invitees.reduce((users, invitee) => {
    if (invitee.projects.length > 0) {
      users.push(invitee.id);
    }
    return users;
  }, []);
  const usersWithActions = invitees.reduce((users, invitee) => {
    if (invitee.actions.length > 0) {
      users.push(invitee.id);
    }
    return users;
  }, []);
  const {actionMaxes, projectMaxes} = await r.table('Action')
        .getAll(r.args(usersWithActions), {index: 'teamMemberId'})
        .group('teamMemberId')
        .max('sortOrder')('sortOrder')
        .ungroup()
      .do((actionMaxes) => {
          return {
            actionMaxes,
            projectMaxes: r.table('Project')
              .getAll(r.args(usersWithProjects), {index: 'teamMemberId'})
              .group('teamMemberId')
              .do((group) => {
                return {
                  teamSort: group.max('teamSort')('teamSort'),
                  userSort: group.max('userSort')('userSort')
                }
              })
              .ungroup()
          }
      });
  //
  const projectMaxSort = projectMaxes.reduce((obj, task) => {
    const {group: teamMemberId, reduction: sortOrderObj} = task;
    obj[teamMemberId] = sortOrderObj;
    return obj;
  }, {});
  const actionMaxSort = actionMaxes.reduce((obj, task) => {
    const {group: teamMemberId, reduction: sortOrder} = task;
    obj[teamMemberId] = sortOrder;
    return obj;
  }, {});
  const updatedActions = [];
  const updatedProjects = [];
  invitees.forEach((invitee) => {
    const maxSort = actionMaxSort[invitee.id];
    invitee.actions.forEach((action, idx) => {
      const id = action.id.substr(action.id.indexOf('::')+2);
      updatedActions.push({
        id,
        sortOrder: maxSort + idx + 1
      })
    });
    const {teamSort, userSort} = projectMaxSort[invitee.id] || {};
    invitee.projects.forEach((project, idx) => {
      const id = project.id.substr(project.id.indexOf('::')+2);
      updatedProjects.push({
        id,
        teamSort: teamSort + idx + 1,
        userSort: userSort + idx + 1
      })
    });
  });
  return {
    updatedActions,
    updatedProjects
  }
}
