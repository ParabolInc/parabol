exports.up = async (r) => {
  try {
    await r.tableCreate('QueryMap')
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await r.tableDrop('QueryMap')
  } catch (e) {
    console.log(e)
  }
}
