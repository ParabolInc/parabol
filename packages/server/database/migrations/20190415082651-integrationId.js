exports.up = async (r) => {
  try {
    // there are 2 old records from 2017 that have no integrationId attached, they should be removed
    await r
      .table('Task')
      .filter(r.row('integration').ne(null))
      .filter(
        r
          .row('integration')('id')
          .eq(null)
      )
      .delete()
      .run()
  } catch (e) {
    console.log(e)
  }

  try {
    await r
      .table('Task')
      .filter((task) =>
        task('integration')
          .default(null)
          .ne(null)
      )
      .update((task) => ({
        integration: r.literal(
          task('integration')
            .merge({
              id: task('integration')('integrationId'),
              service: 'github'
            })
            .without('integrationId')
        )
      }))
      .run()
  } catch (e) {
    console.log(e)
  }

  try {
    await r
      .table('Task')
      .indexDrop('integrationId')
      .run()
  } catch (e) {
    console.log(e)
  }

  try {
    await r
      .table('Task')
      .indexCreate('integrationId', (project) => project('integration')('id'))
      .run()
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await r
      .table('Task')
      .filter((task) =>
        task('integration')('id')
          .default(null)
          .ne(null)
      )
      .update((task) => ({
        integration: task('integration')
          .merge({
            integrationId: task('integration')('id'),
            service: 'GitHubIntegration'
          })
          .without('id')
      }))
      .run()
  } catch (e) {
    /**/
  }

  try {
    await r
      .table('Task')
      .indexDrop('integrationId')
      .run()
  } catch (e) {
    /**/
  }

  try {
    await r
      .table('Task')
      .indexCreate('integrationId', (project) => project('integration')('integrationId'))
      .run()
  } catch (e) {
    /**/
  }
}
