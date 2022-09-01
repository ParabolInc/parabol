import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  await r.table('NewMeeting').indexCreate('meetingSeriesId').run()
}

export const down = async function (r: R) {
  await r.table('NewMeeting').indexDrop('meetingSeriesId').run()
}
