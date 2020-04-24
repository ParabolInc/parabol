/* eslint-disable max-len */
exports.up = async (r) => {
  const indices = [
    r
      .table('Project')
      .indexCreate('tokenExpiration')
      .run()
  ]
  await Promise.all(indices)
  const fields = [
    r
      .table('TeamMember')
      .update(
        {
          email: r
            .table('User')
            .get((row) => {
              return row('userId')
            })('email')
            .default('')
        },
        {nonAtomic: true}
      )
      .run()
  ]
  await Promise.all(fields)
}

exports.down = async (r) => {
  const indices = [
    r
      .table('Project')
      .indexDrop('tokenExpiration')
      .run()
  ]
  await Promise.all(indices)
  const fields = [
    r
      .table('TeamMember')
      .replace(r.row.without('email'))
      .run()
  ]
  await Promise.all(fields)
}
