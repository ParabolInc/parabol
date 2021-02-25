export const up = async function (r) {
  try {
    await Promise.all([
      r
        .db('actionProduction')
        .table('User')
        .indexCreate('createdAt')
        .run(),
      r
        .db('actionProduction')
        .table('User')
        .indexCreate('updatedAt')
        .run(),
    ])
  } catch(e) {
    console.log(e)
  }
};

export const down = async function (r) {
  try {
    await Promise.all([
      r
        .db('actionProduction')
        .table('User')
        .indexDrop('createdAt')
        .run(),
      r
        .db('actionProduction')
        .table('User')
        .indexDrop('updatedAt')
        .run()
    ])
  } catch(e) {
    console.log(e)
  }
};
