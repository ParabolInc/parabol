exports.up = async (r, connection) => {
  await r.tableCreate('Team').run(connection);
  return r.table('Meeting').indexCreate('teamId');
};

exports.down = async (r, connection) => {
  await r.table('Meeting').indexDrop('teamId').run(connection);
  return r.tableDrop('Team').run(connection);
};
