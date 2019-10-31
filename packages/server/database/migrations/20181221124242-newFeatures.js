exports.up = async (r) => {
  try {
    await Promise.all([r.tableCreate('SuggestedAction').run(), r.tableCreate('NewFeature').run()])
  } catch (e) {}
  try {
    await Promise.all([
      r
        .table('SuggestedAction')
        .indexCreate('userId')
        .run()
      // r.table('NewFeature').indexCreate('number'),
    ])
  } catch (e) {}
  // try {
  //   await r.table('User').update({
  //     broadcastNumber: 1
  //   })
  // } catch (e) {}
}

exports.down = async (r) => {
  try {
    await Promise.all([r.tableDrop('SuggestedAction').run(), r.tableDrop('NewFeature').run()])
  } catch (e) {}
}
