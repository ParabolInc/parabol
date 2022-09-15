import {R} from 'rethinkdb-ts'

// note this is almost identical to task-hash (just a different integrationhash prefix) but the old migration didn't run in prod
// due to a merge conflict on migration timestamps
export const up = async function (r: R) {
  // add the hash
  try {
    await r({
      jira: r
        .table('Task')
        .filter((task) => {
          return task('integration')('service').eq('jira').default(false)
        })
        .update((task) => ({
          integrationHash: task('integration')('cloudId')
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
          integrationHash: task('integration')('nameWithOwner')
            .add(':')
            .add(task('integration')('issueNumber'))
            .default('BAD_HASH'),
          integration: task('integration').merge({
            accessUserId: task('createdBy')
          })
        }))
    }).run()
  } catch (e) {
    // noop
  }
  // add index
  try {
    await r.table('Task').indexCreate('integrationHash').run()
  } catch (e) {
    // noop
  }
}

export const down = async function (r: R) {
  await r.table('Task').indexDrop('integrationHash').run()
  await r
    .table('Task')
    .filter((task) => task('integrationHash').default(null).ne(null))
    .replace((row) => row.without('integrationHash'))
    .run()
}
