// importing cypress for typescript defs
import 'cypress'

const getRethink = require('../../server/database/rethinkDriver').default

interface DBOptions {
  source: string
  target: string
}
const resetDb = ({source, target}: DBOptions) => async () => {
  const r = await getRethink()
  // wipe out all records on the target
  const tableList: string[] = await r
    .db(target)
    .tableList()
    .run()
  const filteredTableList: string[] = tableList.filter((tableName) => tableName !== 'QueryMap')
  filteredTableList.forEach((tableName) =>
    r
      .db(target)
      .table(tableName)
      .delete()
      .run()
  )

  // add source docs to target db
  return Promise.all(
    filteredTableList.map((t: any) =>
      r
        .db(target)
        .table(t)
        .insert(
          r
            .db(source)
            .table(t)
            .coerceTo('array')
        )
        .run()
    )
  )
}

export default resetDb
