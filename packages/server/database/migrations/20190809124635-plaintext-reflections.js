import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'

exports.up = async (r) => {
  const reflections = await r.table('RetroReflection').run()
  const reflectionsWithPlaintext = reflections.map((reflection) => ({
    id: reflection.id,
    plaintextContent: extractTextFromDraftString(reflection.content)
  }))
  await r(reflectionsWithPlaintext)
    .forEach((reflection) => {
      return r
        .table('RetroReflection')
        .get(reflection('id'))
        .update({
          plaintextContent: reflection('plaintextContent')
        })
    })
    .run()
}

exports.down = async (r) => {
  await r
    .table('RetroReflection')
    .replace((row) => {
      return row.without('plaintextContent')
    })
    .run()
}
