exports.up = async (r) => {
  try {
    r.table('Task')
      .filter((task) =>
        task('integration')('integrationId')
          .default(null)
          .ne(null)
      )
      .update((task) => ({
        integration: task('integration')
          .merge({
            id: task('integration')('integrationId')
          })
          .without('integrationId')
      }))
  } catch (e) {
    /**/
  }

  try {
    r.table('Task').indexDrop('integrationId')
  } catch (e) {
    /**/
  }

  try {
    r.table('Task').indexCreate('integrationId', (project) => project('integration')('id'))
  } catch (e) {
    /**/
  }
}

exports.down = async (r) => {
  try {
    r.table('Task')
      .filter((task) =>
        task('integration')('id')
          .default(null)
          .ne(null)
      )
      .update((task) => ({
        integration: task('integration')
          .merge({
            integrationId: task('integration')('id')
          })
          .without('id')
      }))
  } catch (e) {
    /**/
  }

  try {
    r.table('Task').indexDrop('integrationId')
  } catch (e) {
    /**/
  }

  try {
    r.table('Task').indexCreate('integrationId', (project) =>
      project('integration')('integrationId')
    )
  } catch (e) {
    /**/
  }
}
