exports.up = async(r) => {
  const tables = [
    r.tableCreate('OrgApproval'),
    r.tableDrop('Participant') // unused table
  ];
  try {
    await Promise.all(tables);
  } catch (e) {
  }
  const indices = [
    r.table('OrgApproval').indexCreate('teamId'),
    r.table('OrgApproval').indexCreate('email'),
  ];
  try {
    await Promise.all(indices);
  } catch (e) {
  }
};

exports.down = async(r) => {
  const tables = [
    r.tableDrop('OrgApproval'),
    r.tableCreate('Participant') // unused table
  ];
  await Promise.all(tables);
  const indices = [
    r.table('Participant').indexCreate('meetingId'), // unused table
    r.table('Participant').indexCreate('userId') // unused table
  ];
  await Promise.all(indices);
};
