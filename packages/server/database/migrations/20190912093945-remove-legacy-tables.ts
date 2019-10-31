exports.up = async (r) => {
  try {
    await Promise.all([
      r.tableDrop('Meeting').run(),
      r.tableDrop('AtlassianProject').run(),
      r.tableDrop('Outcome').run()
    ])
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await Promise.all([
      r.tableCreate('Meeting').run(),
      r.tableCreate('AtlassianProject').run(),
      r.tableCreate('Outcome').run()
    ])
  } catch (e) {
    console.log(e)
  }
}
