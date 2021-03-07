export const up = async function (r) {
  try {
    await Promise.all([
      r.db('actionProduction')
        .table('Team')
        .indexCreate('createdAt')
        .run(),
      r.db('actionProduction')
        .table('Team')
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
      r.db('actionProduction')
        .table('Team')
        .indexDrop('createdAt')
        .run(),
      r.db('actionProduction')
        .table('Team')
        .indexDrop('updatedAt')
        .run()
    ])
  } catch(e) {
    console.log(e)
  }
};
