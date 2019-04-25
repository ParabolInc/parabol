exports.up = async (r) => {
  try {
    await r.tableDrop('GitHubIntegration')
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await r.tableCreate('GitHubIntegration')
  } catch (e) {
    console.log(e)
  }
  const indices = [
    r.table('GitHubIntegration').indexCreate('teamId'),
    r.table('GitHubIntegration').indexCreate('userIds', {multi: true}),
    r.table('GitHubIntegration').indexCreate('nameWithOwner')
  ]
  try {
    await Promise.all(indices)
  } catch (e) {
    console.log('Exception during Promise.all(indices)')
  }
}
