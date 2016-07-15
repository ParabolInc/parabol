exports.up = async (r) => {
  await r.tableCreate('Invitation');
  await r.table('Invitation').indexCreate('meetingId');
  // one row per invite, even resending an invite gets a new row
  return await r.table('Invitation').indexCreate('email');
};

exports.down = async (r) => await r.tableDrop('Invitation');
