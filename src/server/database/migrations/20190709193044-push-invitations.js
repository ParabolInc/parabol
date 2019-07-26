exports.up = async (r) => {
  try {
    await r.tableCreate('PushInvitation')
  } catch (e) {
    console.log(e)
  }
  try {
    await r.table('PushInvitation').indexCreate('userId')
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await r.tableDrop('PushInvitation')
  } catch (e) {
    console.log(e)
  }
}
