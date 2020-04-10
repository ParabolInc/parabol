export const up = async function(r) {
  try {
    await r
      .table('RetroReflection')
      .update({
        isAnonymous: true
      })
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r) {
  await r
    .table('RetroReflection')
    .replace(r.row.without('isAnonymous'))
    .run()
}
