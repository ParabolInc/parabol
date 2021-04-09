import {RTable, TableSchema} from '../../database/stricterR'

type WithId<T> = T & {id: string}

export type CustomResolver = (rethinkValue: string, pgValue: string) => boolean
interface IError<rethinkType, pgType> {
  [key: string]: {
    error: string | string[]
    rethinkRow?: Partial<rethinkType>
    pgRow?: Partial<pgType>
  }
}

function addNeFieldsToErrors<rethinkType, pgType>(
  errors: IError<rethinkType, pgType>,
  neFields: string[],
  rethinkRow: rethinkType,
  pgRow: pgType,
  rowId: string
): void {
  const rethinkNeFields = {}
  const pgNeFields = {}
  for (const neField of neFields) {
    rethinkNeFields[neField] = rethinkRow[neField]
    pgNeFields[neField] = pgRow[neField]
  }
  errors[rowId] = {
    error: neFields,
    rethinkRow: rethinkNeFields,
    pgRow: pgNeFields
  }
}

export async function checkTableEq<rethinkType, pgType>(
  rethinkQuery: RTable<TableSchema>,
  pgQuery: (ids: string[]) => Promise<pgType[]>,
  getPairNeFieldsCb: (rethinkRow: rethinkType, pgRow: pgType) => string[]
): Promise<IError<rethinkType, pgType>> {
  const errors = {} as IError<rethinkType, pgType>
  const batchSize = 3000

  for (let i = 0; i < 1e5; i++) {
    console.log(i)
    const offset = batchSize * i
    const rethinkRows = (await rethinkQuery
      .skip(offset)
      .limit(batchSize)
      .run()) as rethinkType[]
    if (!rethinkRows.length) {
      break
    }

    const ids = rethinkRows.map((t) => (t as WithId<rethinkType>).id) as string[]
    const pgRows = await pgQuery(ids)
    const pgRowsById = {} as {[key: string]: pgType}
    pgRows.forEach((pgRow) => {
      pgRowsById[(pgRow as WithId<pgType>).id] = pgRow
    })

    for (const rethinkRow of rethinkRows) {
      const id = (rethinkRow as WithId<rethinkType>).id
      const pgRow = pgRowsById[id]
      if (!pgRow) {
        errors[id] = {
          error: 'No pg row found for rethink row'
        }
        continue
      }
      const neFields = getPairNeFieldsCb(rethinkRow, pgRow)
      if (neFields.length) {
        addNeFieldsToErrors<rethinkType, pgType>(errors, neFields, rethinkRow, pgRow, id)
      }
    }
  }

  return errors
}
