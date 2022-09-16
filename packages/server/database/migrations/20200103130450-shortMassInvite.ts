import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    await r.tableCreate('MassInvitation').run()
    await r.table('MassInvitation').indexCreate('teamMemberId').run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await r.tableDrop('MassInvitation').run()
  } catch (e) {
    console.log(e)
  }
}
