import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    await r
      .table('TimelineEvent')
      .update({
        isActive: true
      })
      .run()

    await r.table('TimelineEvent').indexCreate('meetingId').run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await r
      .table('TimelineEvent')
      .replace((row) => row.without('isActive'))
      .run()

    await r.table('TimelineEvent').indexDrop('meetingId').run()
  } catch (e) {
    console.log(e)
  }
}
