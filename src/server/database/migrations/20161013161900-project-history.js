/* eslint-disable max-len */
exports.up = async (r) => {
  const tables = [
    r.tableCreate('ProjectHistory'),
    r.tableDrop('TaskOutcomeDiff')
  ];
  await Promise.all(tables);
  const indices = [
    r.table('ProjectHistory').indexCreate('projectIdUpdatedAt', (row) => [row('projectId'), row('updatedAt')]),
    r.table('Project').indexCreate('agendaId')
  ];
  await Promise.all(indices);
};

exports.down = async (r) => {
  const tables = [
    r.tableDrop('ProjectHistory'),
    r.tableCreate('TaskOutcomeDiff'),
  ];
  await Promise.all(tables);
  const indices = [
    r.table('Project').indexDrop('agendaId')
  ];
  await Promise.all(indices);
};
