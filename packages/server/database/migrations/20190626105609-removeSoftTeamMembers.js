exports.up = async (r) => {
  try {
    await r.tableDrop('SoftTeamMember')
  } catch (e) {
    console.log(e)
  }
  try {
    await r
      .table('Task')
      .filter({isSoftTask: true})
      .delete()
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await r.tableCreate('SoftTeamMember')
  } catch (e) {
    console.log(e)
  }
  try {
    await Promise.all([
      r.table('SoftTeamMember').indexCreate('email'),
      r.table('SoftTeamMember').indexCreate('teamId')
    ])
  } catch (e) {
    console.log(e)
  }
}
