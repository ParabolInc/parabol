exports.up = async (r) => {
  const initialTables = [
    r.tableCreate('User'),
    r.tableCreate('TeamMember'),
    r.tableCreate('Invitation'),
    r.tableCreate('Team')
  ];
  await Promise.all(initialTables);
  const initialIndices = [
    r.table('TeamMember').indexCreate('teamId'),
    r.table('TeamMember').indexCreate('userId'),
    // one row per invite, even resending an invite gets a new row
    r.table('Invitation').indexCreate('teamId'),
    r.table('Invitation').indexCreate('email')
  ];
  await Promise.all(initialIndices);
};

exports.down = async (r) => {
  const initialTables = [
    r.tableDrop('User'),
    r.tableDrop('TeamMember'),
    r.tableDrop('Invitation'),
    r.tableDrop('Team')
  ];
  await Promise.all(initialTables);
};
