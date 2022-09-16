import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    await Promise.all([
      r.table('Task').indexDrop('assigneeId').run(),
      r.table('TeamMember').indexDrop('assigneeId').run()
    ])
    await r
      .table('Task')
      .replace((row) => row.without('assigneeId'))
      .run()
  } catch (e) {
    // no log because Task doesn't typically have assigneeId
  }
}

export const down = async function (r: R) {
  try {
    await r
      .table('Task')
      .update((row) => ({
        assigneeId: row('userId').add(row('teamId'))
      }))
      .run()
    await Promise.all([
      r.table('Task').indexCreate('assigneeId').run(),
      r.table('TeamMember').indexCreate('assigneeId').run()
    ])
  } catch (e) {
    console.log(e)
  }
}
