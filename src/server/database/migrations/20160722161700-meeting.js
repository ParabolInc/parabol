exports.up = async (r) => {
  const meetingTables = [
    r.tableCreate('Meeting'),
    r.tableCreate('Task'),
    r.tableCreate('Placeholder'),
    r.tableCreate('Participant'),
    r.tableCreate('Outcome'),
    r.tableCreate('TaskOutcomeDiff')
  ];
  await Promise.all(meetingTables);
  const meetingIndices = [
    r.table('Meeting').indexCreate('teamId'),
    r.table('Task').indexCreate('userId'),
    r.table('Task').indexCreate('teamMemberId'),
    r.table('Placeholder').indexCreate('teamId'),
    r.table('Participant').indexCreate('meetingId'),
    r.table('Participant').indexCreate('userId'),
  ];
  return await Promise.all(meetingIndices);
};

exports.down = async (r) => {
  const meetingTables = [
    r.tableDrop('Meeting'),
    r.tableDrop('Task'),
    r.tableDrop('Placeholder'),
    r.tableDrop('Participant'),
    r.tableDrop('Outcome'),
    r.tableDrop('TaskOutcomeDiff')
  ];
  return await Promise.all(meetingTables);
};
