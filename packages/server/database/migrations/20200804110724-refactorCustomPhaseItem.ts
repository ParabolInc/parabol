exports.up = async (r) => {
  try {
    await r
      .table('CustomPhaseItem')
      .config()
      .update({name: 'ReflectPrompt'})
      .run()
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  return
}
