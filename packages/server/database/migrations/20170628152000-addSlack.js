exports.up = async (r) => {
  const tables = [r.tableCreate('Provider').run(), r.tableCreate('SlackIntegration').run()]
  try {
    await Promise.all(tables)
  } catch (e) {
    console.log('Exception during Promise.all(tables)')
  }
  const indices = [
    r
      .table('Provider')
      .indexCreate('teamIds', {multi: true})
      .run(),
    r
      .table('Provider')
      .indexCreate('providerUserId')
      .run(),
    r
      .table('SlackIntegration')
      .indexCreate('teamId')
      .run()
  ]
  try {
    await Promise.all(indices)
  } catch (e) {
    console.log('Exception during Promise.all(indices)')
  }
}

exports.down = async (r) => {
  const tables = [r.tableDrop('SlackIntegration').run(), r.tableDrop('Provider').run()]
  try {
    await Promise.all(tables)
  } catch (e) {
    console.log('Exception during Promise.all(tables)')
  }
}
