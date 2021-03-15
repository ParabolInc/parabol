export const up = async function (r) {
  try {
    await Promise.all([
      r
        .table('User')
        .indexCreate('createdAt')
        .run(),
      r
        .table('User')
        .indexCreate('updatedAt')
        .run(),
    ])
    await r
      .db('actionProduction')
      .table('User')
      .indexWait()
      .run()
  } catch(e) {
    console.log(e)
  }
};

export const down = async function (r) {
  try {
    await Promise.all([
      r
        .table('User')
        .indexDrop('createdAt')
        .run(),
      r
        .table('User')
        .indexDrop('updatedAt')
        .run()
    ])
  } catch(e) {
    console.log(e)
  }
};
