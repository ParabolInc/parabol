import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    await r
      .table('Task')
      .filter((task) => task('createdBy').default(null).eq(null))
      .update((task) => ({createdBy: task('userId')}))
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function () {
  // no way to selectively undo
}
