import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    await r
      .table('NewMeeting')
      .filter((meeting) => meeting('name').match('Action meeting #'))
      .update((row) => ({
        name: r('Check-in #').add(row('meetingNumber').coerceTo('string'))
      }))
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await r
      .table('NewMeeting')
      .filter((meeting) => meeting('name').match('Check-in #'))
      .update((row) => ({
        name: r('Action meeting #').add(row('meetingNumber').coerceTo('string'))
      }))
      .run()
  } catch (e) {
    console.log(e)
  }
}
