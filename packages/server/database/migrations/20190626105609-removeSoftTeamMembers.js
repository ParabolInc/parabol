exports.up = async (r) => {
  try {
    await r.tableDrop('SoftTeamMember').run()
  } catch (e) {
    console.log(e)
  }
  try {
    await r
      .table('Task')
      .filter({isSoftTask: true})
      .delete()
      .run()
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await r.tableCreate('SoftTeamMember').run()
  } catch (e) {
    console.log(e)
  }
  try {
    await Promise.all([
      r
        .table('SoftTeamMember')
        .indexCreate('email')
        .run(),
      r
        .table('SoftTeamMember')
        .indexCreate('teamId')
        .run()
    ])
  } catch (e) {
    console.log(e)
  }
}
