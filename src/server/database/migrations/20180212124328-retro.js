exports.up = async (r) => {
  try {
    await Promise.all([
      r.tableCreate('CustomPhaseItem'),
      r.tableCreate('NewMeeting'),
      r.tableCreate('RetroThought'),
      r.tableCreate('RetroThoughtGroup'),
  } catch (e) {
    // noop
  }
  try {
    await Promise.all([
      r.table('CustomPhaseItem').indexCreate('teamId'),
      r.table('NewMeeting').indexCreate('teamId'),
      r.table('RetroThought').indexCreate('meetingId'),
      r.table('RetroThought').indexCreate('teamId'),
      r.table('RetroThoughtGroup').indexCreate('meetingId'),
      r.table('RetroThoughtGroup').indexCreate('teamId'),
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
