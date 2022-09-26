import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  // add the hash
  await r({
    jira: r
      .table('Task')
      .filter((task) => {
        return task('integration')('service').eq('jira').default(false)
      })
      .update((task) => ({
        integrationHash: r('jira:')
          .add(task('integration')('cloudId'))
          .add(':')
          .add(task('integration')('issueKey'))
          .default('BAD_HASH'),
        integration: task('integration').merge({
          accessUserId: task('createdBy')
        })
      })),
    github: r
      .table('Task')
      .filter((task) => {
        return task('integration')('service').eq('github').default(false)
      })
      .update((task) => ({
        integrationHash: r('gh:')
          .add(task('integration')('nameWithOwner'))
          .add(':')
          .add(task('integration')('issueNumber'))
          .default('BAD_HASH'),
        integration: task('integration').merge({
          accessUserId: task('createdBy')
        })
      }))
  }).run()

  // add index
  await r.table('Task').indexCreate('integrationHash').run()
}

export const down = async function (r: R) {
  await r.table('Task').indexDrop('integrationHash').run()
  await r
    .table('Task')
    .filter((task) => task('integrationHash').default(null).ne(null))
    .replace((row) => row.without('integrationHash'))
    .run()
}
