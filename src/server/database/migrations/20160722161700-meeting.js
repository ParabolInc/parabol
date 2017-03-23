exports.up = async (r) => {
  const meetingTables = [
    r.tableCreate('Action'),
    r.tableCreate('AgendaItem'),
    r.tableCreate('Meeting'),
    r.tableCreate('Participant'),
    r.tableCreate('Project'),
    r.tableCreate('Outcome'),
    r.tableCreate('TaskOutcomeDiff')
  ];
  await Promise.all(meetingTables);
  const meetingIndices = [
    r.table('Action').indexCreate('userId'),
    r.table('AgendaItem').indexCreate('teamId'),
    r.table('Meeting').indexCreate('teamId'),
    r.table('Participant').indexCreate('meetingId'),
    r.table('Participant').indexCreate('userId'),
    r.table('Project').indexCreate('teamMemberId'),
    r.table('Project').indexCreate('teamIdCreatedAt', (row) => [row('teamId'), row('createdAt')])
  ];
  await Promise.all(meetingIndices);
};

exports.down = async (r) => {
  const meetingTables = [
    r.tableDrop('Action'),
    r.tableDrop('AgendaItem'),
    r.tableDrop('Meeting'),
    r.tableDrop('Participant'),
    r.tableDrop('Project'),
    r.tableDrop('Outcome'),
    r.tableDrop('TaskOutcomeDiff')
  ];
  await Promise.all(meetingTables);
};
