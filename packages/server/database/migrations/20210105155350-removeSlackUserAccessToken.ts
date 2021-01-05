import {R} from 'rethinkdb-ts'
export const up = async function (r: R) {
  const now = new Date()
  try {
    await r
      .table('SlackAuth')
      .replace((row) => row.without('accessToken'))
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await r.table('SlackAuth').update({accessToken: null}).run()
  } catch (e) {
    console.log(e)
  }
}
