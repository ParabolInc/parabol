import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    await r.table('Team').update({lastMeetingType: 'retrospective'}).run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await r
      .table('Team')
      .replace((row) => row.without('lastMeetingType'))
      .run()
  } catch (e) {
    console.log(e)
  }
}
