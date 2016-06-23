exports.up = async r => {
  await r.tableCreate('Invitation');
  await r.table('Invitation').indexCreate('teamId');
  await r.table('Invitation').indexCreate('email');
  return await r.table('Invitation').indexCreate('inviteId');
};

exports.down = async r => {
  return await r.tableDrop('Invitation');
};
