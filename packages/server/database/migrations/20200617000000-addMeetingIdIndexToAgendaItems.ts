import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    await r.table('AgendaItem').indexCreate('meetingId').run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await r.table('AgendaItem').indexDrop('meetingId').run()
  } catch (e) {
    console.log(e)
  }
}
