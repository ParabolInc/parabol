import {R} from 'rethinkdb-ts'
export const up = async function(r: R) {
  const now = new Date()
  try {
    await r
      .table('NewMeeting')
      .update((row) => ({
        createdBy: row('defaultFacilitatorUserId')
      }))
      .run()

    await r
      .table('NewMeeting')
      .replace(r.row.without('defaultFacilitatorUserId'))
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  await r
    .table('NewMeeting')
    .update((row) => ({
      defaultFacilitatorUserId: row('createdBy')
    }))
    .run()

  await r
    .table('NewMeeting')
    .replace(r.row.without('createdBy'))
    .run()
}
