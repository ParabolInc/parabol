import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  await r
    .table('NewMeeting')
    .update((row) => ({
      name: r.branch(
        row('meetingType').eq('retrospective'),
        r('Retro #').add(row('meetingNumber').coerceTo('string')),
        r('Action meeting #').add(row('meetingNumber').coerceTo('string'))
      )
    }))
    .run()
}

export const down = async function (r: R) {
  await r
    .table('NewMeeting')
    .replace((row) => row.without('name'))
    .run()
}
