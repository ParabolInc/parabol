exports.up = async (r) => {
  try {
    await r.tableCreate('TeamInvitation').run()
  } catch (e) {
    // noop
  }
  try {
    await r({
      token: r
        .table('TeamInvitation')
        .indexCreate('token')
        .run(),
      email: r
        .table('TeamInvitation')
        .indexCreate('email')
        .run(),
      teamId: r
        .table('TeamInvitation')
        .indexCreate('teamId')
        .run()
    })
  } catch (e) {}
}

exports.down = async (r) => {
  try {
    await r.tableDrop('TeamInvitation').run()
  } catch (e) {
    // noop
  }
}
