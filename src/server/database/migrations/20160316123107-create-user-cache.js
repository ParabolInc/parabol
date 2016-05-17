exports.up = async (r, connection) => {
  await r.tableCreate('CachedUser').run(connection);
  return r.table('CachedUser').indexCreate('userId');
};

exports.down = async (r, connection) => {
  await r.table('CachedUser').indexDrop('userId').run(connection);
  return r.tableDrop('CachedUser').run(connection);
};
