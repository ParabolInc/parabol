exports.up = async (r) => {
  try {
    await r.tableDrop('GitHubIntegration').run()
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await r.tableCreate('GitHubIntegration').run()
  } catch (e) {
    console.log(e)
  }
  const indices = [
    r
      .table('GitHubIntegration')
      .indexCreate('teamId')
      .run(),
    r
      .table('GitHubIntegration')
      .indexCreate('userIds', {multi: true})
      .run(),
    r
      .table('GitHubIntegration')
      .indexCreate('nameWithOwner')
      .run()
  ]
  try {
    await Promise.all(indices)
  } catch (e) {
    console.log('Exception during Promise.all(indices)')
  }
}
