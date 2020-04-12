exports.up = async (r) => {
  const fields = [
    r
      .table('Project')
      .replace(
        (row) => {
          return row
            .merge({
              sortOrder: row('teamSort').default(r.random())
            })
            .without('teamSort', 'userSort')
        },
        {nonAtomic: true}
      )
      .run()
  ]
  await Promise.all(fields)

  const indices = [
    r
      .table('Project')
      .indexDrop('tokenExpiration')
      .run(),
    r
      .table('Project')
      .indexCreate('userId')
      .run()
  ]
  try {
    await Promise.all(indices)
  } catch (e) {
    // ignore
  }
}

exports.down = async (r) => {
  const fields = [
    r
      .table('Project')
      .replace((row) => {
        return row
          .merge({
            teamSort: row('sortOrder'),
            userSort: row('sortOrder')
          })
          .without('sortOrder')
      })
      .run()
  ]
  await Promise.all(fields)

  const indices = [
    r
      .table('Project')
      .indexCreate('tokenExpiration')
      .run(),
    r
      .table('Project')
      .indexDrop('userId')
      .run()
  ]
  try {
    await Promise.all(indices)
  } catch (e) {
    // ignore
  }
}
