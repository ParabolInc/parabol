exports.up = async (r) => {
  try {
    await Promise.all([r.tableCreate('AtlassianAuth'), r.tableCreate('AtlassianProject')])
  } catch (e) {
    /**/
  }
  try {
    await Promise.all([
      r.table('AtlassianAuth').indexCreate('userId'),
      r.table('AtlassianAuth').indexCreate('teamId'),
      r.table('AtlassianAuth').indexCreate('accountId'),
      r.table('AtlassianProject').indexCreate('userIds', {multi: true}),
      r.table('AtlassianProject').indexCreate('teamId'),
      r.table('AtlassianProject').indexCreate('projectId')
    ])
  } catch (e) {
    /**/
  }
}

exports.down = async (r) => {
  try {
    await Promise.all([r.tableDrop('AtlassianAuth'), r.tableCreate('jiraProject')])
  } catch (e) {
    /**/
  }
}
