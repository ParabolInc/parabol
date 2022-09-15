import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    await r.tableCreate('GQLRequest').run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await r.tableDrop('GQLRequest').run()
  } catch (e) {
    console.log(e)
  }
}
