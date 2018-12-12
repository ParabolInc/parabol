exports.up = async (r) => {
  try {
    await Promise.all([r.tableCreate('SuggestedAction')])
  } catch (e) {}
  try {
    await Promise.all([r.table('SuggestedAction').indexCreate('userId')])
  } catch (e) {}
  try {
    await r.table('User').update({
      broadcastNumber: 1
    })
  } catch (e) {}
}

exports.down = async (r) => {
  try {
    await Promise.all([r.tableDrop('SuggestedAction')])
  } catch (e) {}
}
