exports.up = async (r) => {
  const tables = [
    r.tableCreate('OrgApproval').run(),
    r.tableDrop('Participant').run() // unused table
  ]
  try {
    await Promise.all(tables)
  } catch (e) {
    // ignore
  }
  const indices = [
    r
      .table('OrgApproval')
      .indexCreate('teamId')
      .run(),
    r
      .table('OrgApproval')
      .indexCreate('email')
      .run()
  ]
  try {
    await Promise.all(indices)
  } catch (e) {
    // ignore
  }
}

exports.down = async (r) => {
  const tables = [
    r.tableDrop('OrgApproval'),
    r.tableCreate('Participant') // unused table
  ]
  try {
    await Promise.all(tables)
  } catch (e) {
    // ignore
  }
  const indices = [
    r.table('Participant').indexCreate('meetingId'), // unused table
    r.table('Participant').indexCreate('userId') // unused table
  ]
  try {
    await Promise.all(indices)
  } catch (e) {
    // ignore
  }
}
