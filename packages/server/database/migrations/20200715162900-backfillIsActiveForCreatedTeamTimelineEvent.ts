import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    await r
      .table('TimelineEvent')
      .filter((event) => event.hasFields('isActive').not())
      .update({
        isActive: true
      })
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function () {
  // noop
}
