/* eslint-disable max-len */
exports.up = async (r) => {
  const tables = [r.tableCreate('ProjectHistory').run(), r.tableDrop('TaskOutcomeDiff').run()]
  await Promise.all(tables)
  const indices = [
    r
      .table('ProjectHistory')
      .indexCreate('projectIdUpdatedAt', (row) => [row('projectId'), row('updatedAt')])
      .run(),
    r
      .table('Project')
      .indexCreate('agendaId')
      .run()
  ]
  await Promise.all(indices)
}

exports.down = async (r) => {
  const tables = [r.tableDrop('ProjectHistory').run(), r.tableCreate('TaskOutcomeDiff').run()]
  await Promise.all(tables)
  const indices = [
    r
      .table('Project')
      .indexDrop('agendaId')
      .run()
  ]
  await Promise.all(indices)
}
