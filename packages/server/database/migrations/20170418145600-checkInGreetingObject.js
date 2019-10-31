exports.up = async (r) => {
  await r
    .table('Team')
    .replace(r.row.without('checkInGreeting'))
    .run()
}

exports.down = async (r) => {
  await r
    .table('Team')
    .replace(r.row.without('checkInGreeting'))
    .run()
}
