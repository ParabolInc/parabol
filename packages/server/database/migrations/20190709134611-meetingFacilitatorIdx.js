exports.up = async (r) => {
  try {
    await r.table('NewMeeting').indexCreate('facilitatorUserId')
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await r.table('NewMeeting').indexDrop('facilitatorUserId')
  } catch (e) {
    console.log(e)
  }
}
