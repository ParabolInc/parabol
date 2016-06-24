exports.up = async (r, connection) => {
  await r.tableCreate('TeamMember').run(connection);
  await r.table('TeamMember').indexCreate('teamId').run(connection);
  // await r.table('TeamMember').indexCreate('inviteId').run(connection);
  return await r.table('TeamMember').indexCreate('userCacheId').run(connection);
};

exports.down = async (r, connection) => {
  await r.table('TeamMember').indexDrop('userCacheId').run(connection);
  // await r.table('TeamMember').indexDrop('inviteId').run(connection);
  await r.table('TeamMember').indexDrop('teamId').run(connection);
  return await r.tableDrop('TeamMember').run(connection);
};
