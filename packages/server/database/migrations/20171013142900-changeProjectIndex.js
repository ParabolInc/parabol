exports.up = async (r) => {
  await r({
    newIdx: r
      .table('Project')
      .indexCreate('teamIdUpdatedAt', (row) => [row('teamId'), row('updatedAt')]),
    oldIdx: r.table('Project').indexDrop('teamIdCreatedAt')
  }).run()
}

exports.down = async (r) => {
  await r({
    newIdx: r
      .table('Project')
      .indexCreate('teamIdCreatedAt', (row) => [row('teamId'), row('createdAt')]),
    oldIdx: r.table('Project').indexDrop('teamIdUpdatedAt')
  }).run()
}
