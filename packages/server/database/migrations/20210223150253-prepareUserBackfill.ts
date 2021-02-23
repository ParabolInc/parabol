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
      r
        .table('User')
        .getAll('love@parabol.co', {index: 'email'})
        .update(row => ({tms: [row('tms')]}))
        .run()
    ])
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
