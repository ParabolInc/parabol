import {R} from 'rethinkdb-ts'
export const up = async function (r: R) {
  try {
    await r.table('ReflectPrompt').replace(r.row.without('title')).run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await r
      .table('ReflectPrompt')
      .update((row) => ({title: row('question')}))
      .run()
  } catch (e) {
    console.log(e)
  }
}
