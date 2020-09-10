import {R} from 'rethinkdb-ts'
export const up = async function(r: R) {
  try {
    await r
      .table('User')
      .replace(r.row.without('lastSeenAtURL'))
      .run()
    await r
      .table('User')
      .replace(r.row.without('connectedSockets'))
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  try {
    await r
      .table('User')
      .indexCreate('lastSeenAtURL')
      .run()

    await r
      .table('User')
      .indexCreate('connectedSockets')
      .run()
  } catch (e) {
    console.log(e)
  }
}
