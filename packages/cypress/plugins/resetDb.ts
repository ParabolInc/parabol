// importing cypress for typescript defs
import 'cypress'

const getRethink = require('parabol-server/database/rethinkDriver')

interface DBOptions {
  source: string
  target: string
}
const resetDb = ({source, target}: DBOptions) => async () => {
  const r = await getRethink()
  // wipe out all records on the target
  await r
    .db(target)
    .tableList()
    .forEach((t: string) =>
      r
        .db(target)
        .table(t)
        .delete()
    )
  // add source docs to target db
  return r.db(target).forEach((t: string) => {
    return r
      .db(target)
      .table(t)
      .insert(r.db(source).table(t))
  })
}

export default resetDb
