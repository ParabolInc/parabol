import getRethink from '../../database/rethinkDriver'
import {RTable, TableSchema} from '../../database/stricterR'
import getPg from '../getPg'

interface DBDoc {
  id: string
  [key: string]: any
}
interface RethinkDoc extends DBDoc {}
interface PGDoc extends DBDoc {}

interface Diff {
  id: string | number
  prop: string
  rVal: string | number | boolean | undefined | null
  pgVal: string | number | boolean | undefined | null
}

export const checkRowCount = async (tableName: string) => {
  const pg = getPg()
  const r = await getRethink()
  const [rCount, pgRes] = await Promise.all([
    r
      .table(tableName as any)
      .count()
      .run(),
    pg.query<{count: number}>(`SELECT COUNT(*) FROM "${tableName}";`)
  ])
  const pgCount = Number(pgRes.rows[0].count)
  return rCount === pgCount
    ? `Row count matches. ${rCount} in both DBs.`
    : `Row count mismatch. RethinkDB: ${rCount}. PG: ${pgCount}`
}

export async function checkTableEq(
  rethinkQuery: RTable<TableSchema>,
  pgQuery: (ids: string[]) => Promise<PGDoc[] | null>,
  equalityMap: Record<string, (a: unknown, b: unknown) => boolean>,
  maxErrors = 10
) {
  const batchSize = 3000
  const errors = [] as Diff[]
  const propsToCheck = Object.keys(equalityMap)

  for (let i = 0; i < 1e6; i++) {
    const offset = batchSize * i
    const rethinkRows = (await rethinkQuery.skip(offset).limit(batchSize).run()) as RethinkDoc[]
    if (!rethinkRows.length) break
    const ids = rethinkRows.map((t) => t.id)
    const pgRows = (await pgQuery(ids)) ?? []
    const pgRowsById = {} as {[key: string]: PGDoc}
    pgRows.forEach((pgRow) => {
      pgRowsById[pgRow.id] = pgRow
    })

    for (const rethinkRow of rethinkRows) {
      const {id} = rethinkRow
      const pgRow = pgRowsById[id]

      if (!pgRow) {
        errors.push({id, prop: id, rVal: id, pgVal: null})
        if (errors.length >= maxErrors) return errors
        continue
      }
      for (const prop of propsToCheck) {
        const eqFn = equalityMap[prop]
        const rVal = rethinkRow[prop]
        const pgVal = pgRow[prop]
        const isEqual = eqFn(rVal, pgVal)
        if (!isEqual) {
          errors.push({id, prop, rVal, pgVal})
          if (errors.length >= maxErrors) return errors
        }
      }
    }
  }
  return errors
}
