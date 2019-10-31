exports.up = async (r) => {
  try {
    await Promise.all([r.tableCreate('AtlassianAuth').run()])
  } catch (e) {
    /**/
  }
  try {
    await Promise.all([
      r
        .table('AtlassianAuth')
        .indexCreate('userId')
        .run(),
      r
        .table('AtlassianAuth')
        .indexCreate('teamId')
        .run(),
      r
        .table('AtlassianAuth')
        .indexCreate('accountId')
        .run()
    ])
  } catch (e) {
    /**/
  }
}

exports.down = async (r) => {
  try {
    await Promise.all([r.tableDrop('AtlassianAuth').run()])
  } catch (e) {
    /**/
  }
}
