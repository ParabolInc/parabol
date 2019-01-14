exports.up = async (r) => {
  try {
    await Promise.all([
      r.tableCreate('SuggestedAction')
      // r.tableCreate('NewFeature')
    ])
  } catch (e) {}
  try {
    await Promise.all([
      r.table('SuggestedAction').indexCreate('userId')
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
    await Promise.all([r.tableDrop('SuggestedAction')])
  } catch (e) {}
}
