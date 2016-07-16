exports.up = async (r) => {
  const initialTables = [
    r.tableCreate('CachedUser'),
    r.tableCreate('UserProfile'),
    r.tableCreate('TeamMember'),
    r.tableCreate('Invitation'),
    r.tableCreate('Meeting')
  ];
  await Promise.all(initialTables);
  const initialIndices = [
    r.table('TeamMember').indexCreate('meetingId'),
    r.table('TeamMember').indexCreate('userId'),
    // one row per invite, even resending an invite gets a new row
    r.table('Invitation').indexCreate('meetingId'),
    r.table('Invitation').indexCreate('email')
  ];
  return await Promise.all(initialIndices);
};

exports.down = async (r) => {
  const initialTables = [
    r.tableDrop('CachedUser'),
    r.tableDrop('UserProfile'),
    r.tableDrop('TeamMember'),
    r.tableDrop('Invitation'),
    r.tableDrop('Meeting')
  ];
  return await Promise.all(initialTables);
};
