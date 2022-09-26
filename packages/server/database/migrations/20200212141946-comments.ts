import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    await r.tableCreate('Comment').run()
    await Promise.all([
      r.table('Comment').indexCreate('threadId').run(),
      r.table('Task').indexDrop('agendaId').run()
    ])
    await r
      .table('Task')
      .filter((row) => row('agendaId').default(null).ne(null))
      .replace((row) =>
        row
          .merge({
            threadId: row('agendaId'),
            threadSource: 'AGENDA_ITEM'
          })
          .without('agendaId')
      )
      .run()
    await r
      .table('Task')
      .filter((row) => row('reflectionGroupId').default(null).ne(null))
      .replace((row) =>
        row
          .merge({
            threadId: row('reflectionGroupId'),
            threadSource: 'REFLECTION_GROUP'
          })
          .without('reflectionGroupId')
      )
      .run()

    await r.table('Task').indexCreate('threadId').run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await r.tableDrop('Comment').run()
    await r.table('Task').indexDrop('threadId').run()
    await r
      .table('Task')
      .filter((row) => row('threadId').default(null).ne(null))
      .replace((row) =>
        row
          .merge({
            agendaId: r.branch(row('threadSource').eq('AGENDA_ITEM'), row('threadId'), null),
            reflectionGroupId: r.branch(
              row('threadSource').eq('REFLECTION_GROUP'),
              row('threadId'),
              null
            )
          })
          .without('threadId', 'threadSource')
      )
      .run()
    await r.table('Task').indexCreate('agendaId').run()
  } catch (e) {
    console.log(e)
  }
}
