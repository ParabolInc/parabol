exports.up = async (r) => {
  await r
    .table('Project')
    .config()
    .update({name: 'Task'})
  await r
    .table('ProjectHistory')
    .config()
    .update({name: 'TaskHistory'})
};

exports.down = async (r) => {
  await r
    .table('Task')
    .config()
    .update({name: 'Project'})
  await r
    .table('TaskHistory')
    .config()
    .update({name: 'ProjectHistory'})
};
