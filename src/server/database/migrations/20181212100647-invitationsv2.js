exports.up = async (r) => {
  try {
    await r.tableCreate('TeamInvitation')
  } catch (e) {
    // noop
  }
  try {
    await r.table('TeamInvitation').indexCreate('token')
  } catch (e) {}
}

exports.down = async (r) => {
  try {
    await r.tableDrop('TeamInvitation')
  } catch (e) {
    // noop
  }
}
