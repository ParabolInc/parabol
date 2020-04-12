exports.up = async (r) => {
  const initialTables = [
    r.tableCreate('User').run(),
    r.tableCreate('TeamMember').run(),
    r.tableCreate('Invitation').run(),
    r.tableCreate('Team').run()
  ]
  await Promise.all(initialTables)
  const initialIndices = [
    r
      .table('TeamMember')
      .indexCreate('teamId')
      .run(),
    r
      .table('TeamMember')
      .indexCreate('userId')
      .run(),
    // one row per invite, even resending an invite gets a new row
    r
      .table('Invitation')
      .indexCreate('teamId')
      .run(),
    r
      .table('Invitation')
      .indexCreate('email')
      .run()
  ]
  await Promise.all(initialIndices)
}

exports.down = async (r) => {
  const initialTables = [
    r.tableDrop('User').run(),
    r.tableDrop('TeamMember').run(),
    r.tableDrop('Invitation').run(),
    r.tableDrop('Team').run()
  ]
  await Promise.all(initialTables)
}
