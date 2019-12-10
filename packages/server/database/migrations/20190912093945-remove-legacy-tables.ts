exports.up = async (r) => {
  try {
    await Promise.all([
      r.tableDrop('Meeting').run(),
      r.tableDrop('Outcome').run(),
      r
        .branch(r.tableList().contains('AtlassianProject'), r.tableDrop('AtlassianProject'), null)
        .run()
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
