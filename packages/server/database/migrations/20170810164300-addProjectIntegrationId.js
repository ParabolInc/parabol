exports.up = async (r) => {
  const indices = [
    r
      .table('Project')
      .indexCreate('integrationId', (project) => project('integration')('integrationId'))
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

exports.down = async (r) => {
  const indices = [
    r
      .table('Project')
      .indexDrop('integrationId')
      .run(),
    r
      .table('GitHubIntegration')
      .indexDrop('nameWithOwner')
      .run()
  ]
  try {
    await Promise.all(indices)
  } catch (e) {
    console.log('Exception during Promise.all(tables)')
  }
}
