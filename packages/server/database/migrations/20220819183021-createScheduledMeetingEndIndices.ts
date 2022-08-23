import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  await r
    .table('NewMeeting')
    .indexCreate('hasEndedScheduledEndTime', [
      r.row.hasFields('endedAt'),
      r.row('scheduledEndTime')
    ])
    .run()
}

export const down = async function (r: R) {
  await r.table('NewMeeting').indexDrop('hasEndedScheduledEndTime').run()
}
