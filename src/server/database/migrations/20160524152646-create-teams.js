exports.up = async (r, connection) => {
  await r.tableCreate('Team').run(connection);
  return await r.table('Meeting').indexCreate('teamId').run(connection);
};

exports.down = async (r, connection) => {
  await r.table('Meeting').indexDrop('teamId').run(connection);
  return await r.tableDrop('Team').run(connection);
};
