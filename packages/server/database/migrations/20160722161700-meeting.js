exports.up = async (r) => {
  const meetingTables = [
    r.tableCreate('Action').run(),
    r.tableCreate('AgendaItem').run(),
    r.tableCreate('Meeting').run(),
    r.tableCreate('Participant').run(),
    r.tableCreate('Project').run(),
    r.tableCreate('Outcome').run(),
    r.tableCreate('TaskOutcomeDiff').run()
  ]
  await Promise.all(meetingTables)
  const meetingIndices = [
    r
      .table('Action')
      .indexCreate('userId')
      .run(),
    r
      .table('AgendaItem')
      .indexCreate('teamId')
      .run(),
    r
      .table('Meeting')
      .indexCreate('teamId')
      .run(),
    r
      .table('Participant')
      .indexCreate('meetingId')
      .run(),
    r
      .table('Participant')
      .indexCreate('userId')
      .run(),
    r
      .table('Project')
      .indexCreate('teamMemberId')
      .run(),
    r
      .table('Project')
      .indexCreate('teamIdCreatedAt', (row) => [row('teamId'), row('createdAt')])
      .run()
  ]
  await Promise.all(meetingIndices)
}

exports.down = async (r) => {
  const meetingTables = [
    r.tableDrop('Action').run(),
    r.tableDrop('AgendaItem').run(),
    r.tableDrop('Meeting').run(),
    r.tableDrop('Participant').run(),
    r.tableDrop('Project').run(),
    r.tableDrop('Outcome').run(),
    r.tableDrop('TaskOutcomeDiff').run()
  ]
  await Promise.all(meetingTables)
}
