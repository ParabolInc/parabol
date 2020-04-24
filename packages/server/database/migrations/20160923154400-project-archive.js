/* eslint-disable max-len */
exports.up = async (r) => {
  const queries = [
    r
      .table('Project')
      .update((doc) => ({
        isArchived: false,
        teamId: doc('id')
          .split('::')
          .nth(0)
      }))
      .run(),
    r
      .table('Project')
      .indexCreate('teamId')
      .run()
  ]
  await Promise.all(queries)
}

exports.down = async (r) => {
  const queries = [
    r
      .table('Project')
      .indexDrop('teamId')
      .run(),
    r
      .table('Project')
      .replace(r.row.without('teamId', 'isArchived'))
      .run()
  ]
  await Promise.all(queries)
}
