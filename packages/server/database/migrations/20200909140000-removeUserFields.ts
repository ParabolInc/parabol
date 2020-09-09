import {R} from 'rethinkdb-ts'
export const up = async function(r: R) {
  try {
    const url = await r
      .table('User')
      .replace(r.row.without('lastSeenAtURL'))
      .run()
    const sockets = await r
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
  } catch (e) {
    console.log(e)
  }
}
