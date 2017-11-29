exports.up = async (r) => {
  // rename the Project/ProjectHistory tables
  await r
    .table('Project')
    .config()
    .update({name: 'Task'});
  await r
    .table('ProjectHistory')
    .config()
    .update({name: 'TaskHistory'});
  await r
    .table('TaskHistory')
    .indexDrop('projectIdUpdatedAt');
  await r
    .table('TaskHistory')
    .indexCreate('taskIdUpdatedAt', (row) => [row('taskId'), row('updatedAt')]);

  // replace TaskHistory.projectId with TaskHistory.taskId
  await r
    .table('TaskHistory')
    .filter(r.row.hasFields('projectId'))
    .update((taskHistory) =>
      taskHistory
        .merge({taskId: taskHistory('projectId')})
        .without('projectId')
    );

  // replace Meeting.projects with Meeting.tasks
  await r
    .table('Meeting')
    .filter(r.row.hasFields('projects'))
    .update((meeting) =>
      meeting
        .merge({tasks: meeting('projects')})
        .without('projects')
    );

  // replace Meeting.invitees.projects with Meeting.invitees.tasks
  await r
    .table('Meeting')
    .filter(r.row.hasFields('invitees'))
    .update((meeting) =>
      meeting.merge({
        invitees: meeting('invitees').map((invitee) =>
          invitee
            .merge({tasks: invitee('projects')})
            .without('projects')
        )
      })
    );

  // replace Notification.projectId wth Notification.taskId, and PROJECT_INVOLVES notification type to TASK_INVOLVES
  await r
    .table('Notification')
    .filter(r.row.hasFields('projectId').and(r.row('type').eq('PROJECT_INVOLVES')))
    .update((notification) =>
      notification
        .merge({
          taskId: notification('projectId'),
          type: 'TASK_INVOLVES'
        })
        .without('projectId')
    );
};

exports.down = async (r) => {
  // rename the Task/TaskHistory tables
  await r
    .table('Task')
    .config()
    .update({name: 'Project'});
  await r
    .table('TaskHistory')
    .config()
    .update({name: 'ProjectHistory'});
  await r
    .table('ProjectHistory')
    .indexDrop('taskIdUpdatedAt');
  await r
    .table('ProjectHistory')
    .indexCreate('projectIdUpdatedAt', (row) => [row('projectId'), row('updatedAt')]);

  // replace ProjectHistory.taskId with ProjectHistory.projectId
  await r
    .table('ProjectHistory')
    .filter(r.row.hasFields('taskId'))
    .update((projectHistory) =>
      projectHistory
        .merge({projectId: projectHistory('taskId')})
        .without('taskId')
    );

  // replace Meeting.projects with Meeting.tasks
  await r
    .table('Meeting')
    .filter(r.row.hasFields('tasks'))
    .update((meeting) =>
      meeting
        .merge({projects: meeting('tasks')})
        .without('tasks')
    );

  // replace Meeting.invitees.projects with Meeting.invitees.tasks
  await r
    .table('Meeting')
    .filter(r.row.hasFields('invitees'))
    .update((meeting) =>
      meeting.merge({
        invitees: meeting('invitees').map((invitee) =>
          invitee
            .merge({projects: invitee('tasks')})
            .without('tasks')
        )
      })
    );

  // replace Notification.projectId wth Notification.taskId, and PROJECT_INVOLVES notification type to TASK_INVOLVES
  await r
    .table('Notification')
    .filter(r.row.hasFields('taskId').and(r.row('type').eq('TASK_INVOLVES')))
    .update((notification) =>
      notification
        .merge({
          projectId: notification('taskId'),
          type: 'PROJECT_INVOLVES'
        })
        .without('taskId')
    );
};
