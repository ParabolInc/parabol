import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    await r
      .table('AgendaItem')
      .update({meetingId: ''})
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await r
      .table('AgendaItem')
      .replace((row) => row.without('meetingId'))
      .run()
  } catch (e) {
    console.log(e)
  }
}
