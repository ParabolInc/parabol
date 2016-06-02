exports.up = async (r, connection) => {
  await r.tableCreate('UserProfile').run(connection);
  await r.table('UserProfile').indexCreate('cachedUserId').run(connection);
  return await r.table('CachedUser').indexCreate('userProfileId').run(connection);
};

exports.down = async (r, connection) => {
  await r.table('CachedUser').indexDrop('userProfileId').run(connection);
  await r.table('UserProfile').indexDrop('cachedUserId').run(connection);
  return await r.tableDrop('UserProfile').run(connection);
};
