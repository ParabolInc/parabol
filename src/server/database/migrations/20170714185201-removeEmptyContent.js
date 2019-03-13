exports.up = async (r) => {
  r.table('Project')
    .filter((doc) => doc('content').match('"?blocks"?:\\s*\\[\\s*]'))
    .delete()
    .run()
}

exports.down = async () => {
  // noop
}
