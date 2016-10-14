/* eslint-disable max-len */
exports.up = async(r) => {
  const tables = [
    r.tableCreate('ProjectHistory'),
  ];
  await Promise.all(tables);
  const indices = [
    r.table('ProjectHistory').indexCreate('projectIdUpdatedAt', (row) => [row('projectId'), row('updatedAt')])
  ];
  await Promise.all(indices);
};

exports.down = async(r) => {
  const tables = [
    r.tableDrop('ProjectHistory')
  ];
  return await Promise.all(tables);
};
