exports.up = async (r) => {
  await r.tableCreate('TeamMember');
  await r.table('TeamMember').indexCreate('meetingId');
  return await r.table('TeamMember').indexCreate('userId');
};

exports.down = async (r) => await r.tableDrop('TeamMember');
