import {R} from 'rethinkdb-ts'

export const up = async function(r: R) {
  try {
    await r
      .table('NewMeeting')
      .filter((meeting) => meeting('name').match('Action meeting'))
      .update(
        (meeting) => ({
          name: r.js(`${meeting}("name").replace("Action meeting", "Check-in")`)
        }),
        {nonAtomic: true}
      )
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r) {
  try {
    await r
      .table('NewMeeting')
      .filter((meeting) => meeting('name').match('Check-in'))
      .update(
        (meeting) => ({
          name: r.js(`${meeting}("name").replace("Check-in", "Action meeting")`)
        }),
        {nonAtomic: true}
      )
      .run()
  } catch (e) {
    console.log(e)
  }
}
