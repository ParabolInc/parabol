exports.up = async (r) => {
  const tables = [
    r
      .table('Provider')
      .replace((row) => {
        return row
          .merge({
            teamId: row('teamIds')(0).default(null),
            isActive: row('teamIds')
              .count()
              .ne(0)
          })
          .without('teamIds')
      })
      .run()
  ]
  try {
    await Promise.all(tables)
  } catch (e) {
    console.log('Exception during Promise.all(tables)')
  }
  const indices = [
    r
      .table('Provider')
      .indexDrop('teamIds')
      .run(),
    r
      .table('Provider')
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
  const tables = [
    r
      .tableDrop('Provider')
      .replace((row) => {
        return row
          .merge({
            teamIds: r.branch(row('teamId'), [row('teamId')], [])
          })
          .without('teamId', 'isActive')
      })
      .run()
  ]
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
      .indexDrop('teamId')
      .run()
  ]
  try {
    await Promise.all(indices)
  } catch (e) {
    console.log('Exception during Promise.all(indices)')
  }
}
