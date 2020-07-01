export const up = async function(r) {
  try {
    await Promise.all([
      r
        .table('User')
        .indexCreate('createdAt')
        .run(),
      r
        .table('User')
        .indexCreate('lastSeenAt')
        .run()
    ])
  } catch (e) {
    console.log('Exception during index creation')
  }
}

export const down = async function(r) {
  try {
    await Promise.all([
      r
        .table('User')
        .indexDrop('createdAt')
        .run(),
      r
        .table('User')
        .indexDrop('lastSeenAt')
        .run()
    ])
  } catch (e) {
    console.log('Exception during index drop')
  }
}
