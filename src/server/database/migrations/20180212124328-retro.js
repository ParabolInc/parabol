exports.up = async (r) => {
  try {
    await Promise.all([
      r.tableCreate('CustomPhaseItem'),
      r.tableCreate('NewMeeting')
  } catch (e) {
    // noop
  }
  try {
    await Promise.all([
      r.table('CustomPhaseItem').indexCreate('teamId'),
      r.table('NewMeeting').indexCreate('teamId')
    ]);
  } catch (e) {
    // noop
  }
};

exports.down = async (r) => {
  try {
    await Promise.all([
      r.tableDrop('CustomPhaseItem'),
      r.tableDrop('NewMeeting')
    ])
  } catch (e) {
    // noop
  }
};
