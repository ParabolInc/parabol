import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    await r.table('RetroReflection').update({reactjis: []}).run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await r
      .table('RetroReflection')
      .replace((row) => row.without('reactjis'))
      .run()
  } catch (e) {
    console.log(e)
  }
}
