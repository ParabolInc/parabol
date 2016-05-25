exports.up = async (r, connection) => {
  await r.tableCreate('CachedUser').run(connection);
  return await r.table('CachedUser').indexCreate('userId').run(connection);
};

exports.down = async (r, connection) => {
  await r.table('CachedUser').indexDrop('userId').run(connection);
  return await r.tableDrop('CachedUser').run(connection);
};
