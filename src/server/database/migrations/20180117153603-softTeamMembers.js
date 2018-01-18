exports.up = async (r) => {
  try {
    await r.tableCreate('SoftTeamMember')
  } catch(e) {
    // noop
  }
  try {
    await r.table('SoftTeamMember').indexCreate('email');
  } catch(e) {
    // noop
  }
};

exports.down = async (r) => {
  try {
    await r.tableDrop('SoftTeamMember');
  } catch(e) {
    // noop
  }
};
