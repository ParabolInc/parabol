exports.up = async (r) => {
  await r
    .table('Team')
    .update({isArchived: false})
    .run()
}

exports.down = async (r) => {
  await r
    .table('Action')
    .replace(r.row.without('isArchived'))
    .run()
}
