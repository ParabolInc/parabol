exports.up = async (r) => {
  try {
    await r.tableCreate('QueryMap').run()
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await r.tableDrop('QueryMap').run()
  } catch (e) {
    console.log(e)
  }
}
