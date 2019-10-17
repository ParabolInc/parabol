exports.up = async (r) => {
  const tables = [r.tableCreate('GitHubIntegration').run()]
  try {
    await Promise.all(tables)
  } catch (e) {
    console.log('Exception during Promise.all(tables)')
  }
  const indices = [
    r
      .table('GitHubIntegration')
      .indexCreate('teamId')
      .run(),
    r
      .table('GitHubIntegration')
      .indexCreate('userIds', {multi: true})
      .run()
  ]
  try {
    await Promise.all(indices)
  } catch (e) {
    console.log('Exception during Promise.all(indices)')
  }
}

exports.down = async (r) => {
  const tables = [r.tableDrop('GitHubIntegration').run()]
  try {
    await Promise.all(tables)
  } catch (e) {
    console.log('Exception during Promise.all(tables)')
  }
}
