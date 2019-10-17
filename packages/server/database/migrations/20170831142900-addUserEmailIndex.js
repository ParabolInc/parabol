exports.up = async (r) => {
  try {
    await r
      .table('User')
      .indexCreate('email')
      .run()
  } catch (e) {
    console.log('Exception during index creation')
  }
}

exports.down = async (r) => {
  try {
    await r
      .table('User')
      .indexDrop('email')
      .run()
  } catch (e) {
    console.log('Exception during index drop')
  }
}
