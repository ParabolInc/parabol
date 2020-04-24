exports.up = async (r) => {
  try {
    await r.tableCreate('PushInvitation').run()
  } catch (e) {
    console.log(e)
  }
  try {
    await r
      .table('PushInvitation')
      .indexCreate('userId')
      .run()
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await r.tableDrop('PushInvitation').run()
  } catch (e) {
    console.log(e)
  }
}
