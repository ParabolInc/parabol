/* eslint-disable max-len */
// taya, jordan, terry, matt
const productTeam = [
  'auth0|5ad119debcb4500e4f4e2808',
  'auth0|5ad184fabcb4500e4f4e345e',
  'auth0|5ad184ad6d59890e8635d9e4',
  'auth0|5ad1851a6d59890e8635d9eb'
]
const engineeringTeam = [
  'auth0|5ad119debcb4500e4f4e2808',
  'auth0|5ad184fabcb4500e4f4e345e',
  'auth0|5ad1851a6d59890e8635d9eb'
]
exports.up = async (r) => {
  const fields = [
    r
      .table('User')
      .getAll(r.args(engineeringTeam), {index: 'id'})
      .update({tms: ['team123', 'team456']})
      .run(),
    r
      .table('User')
      .get(productTeam[0])
      .update({tms: ['team123']})
      .run()
  ]
  await Promise.all(fields)
}

exports.down = async (r) => {
  const fields = [
    r
      .table('User')
      .getAll(r.args(productTeam))
      .update({tms: []})
      .run()
  ]
  await Promise.all(fields)
}
