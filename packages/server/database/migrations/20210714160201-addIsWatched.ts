import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  await r
    .table('User')
    .filter((row) => row.hasFields('isWatched').not())
    .update({isWatched: false})
    .run()
}

export const down = async function (r: R) {
  await r
    .table('User')
    .replace((row) => row.without('isWatched'))
    .run()
}
