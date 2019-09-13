exports.up = async (r) => {
  try {
    await Promise.all(
      [
        r.tableDrop('Meeting'),
        r.tableDrop('AtlassianProject'),
        r.tableDrop('Outcome')
      ])
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await Promise.all(
      [
        r.tableCreate('Meeting'),
        r.tableCreate('AtlassianProject'),
        r.tableCreate('Outcome')
      ])
  } catch (e) {
    console.log(e)
  }
}
