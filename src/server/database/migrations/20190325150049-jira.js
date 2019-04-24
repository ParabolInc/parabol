exports.up = async (r) => {
  try {
    await Promise.all([r.tableCreate('AtlassianAuth')])
  } catch (e) {
    /**/
  }
  try {
    await Promise.all([
      r.table('AtlassianAuth').indexCreate('userId'),
      r.table('AtlassianAuth').indexCreate('teamId'),
      r.table('AtlassianAuth').indexCreate('accountId')
    ])
  } catch (e) {
    /**/
  }
}

exports.down = async (r) => {
  try {
    await Promise.all([r.tableDrop('AtlassianAuth')])
  } catch (e) {
    /**/
  }
}
