import {RTable, TableSchema} from '../../database/stricterR'
import areEqual from 'fbjs/lib/areEqual'

interface DBDoc {
  id: string
  [key: string]: any
}
interface RethinkDoc extends DBDoc {}
interface PGDoc extends DBDoc {}

interface IError {
  [key: string]:
    | {
        error: string | string[]
        rethinkRow?: Partial<RethinkDoc>
        pgRow?: Partial<PGDoc>
      }
    | number
  recordsCompared: number,
  foundErrors: number
}

function getPairNeFields(
  rethinkRow: RethinkDoc,
  pgRow: PGDoc,
  alwaysDefinedFields: string[],
  maybeUndefinedFieldsDefaultValues: {[key: string]: any}
): string[] {
  const neFields = [] as string[]

  for (const f of alwaysDefinedFields) {
    const [rethinkValue, pgValue] = [rethinkRow[f], pgRow[f]]
    if (!areEqual(rethinkValue, pgValue)) {
      neFields.push(f)
    }
  }
  for (const [f, defaultValue] of Object.entries(maybeUndefinedFieldsDefaultValues)) {
    const [rethinkValue, pgValue] = [rethinkRow[f], pgRow[f]]
    if (rethinkValue !== undefined) {
      if (!areEqual(rethinkValue, pgValue)) {
        neFields.push(f)
      }
    } else {
      if (!areEqual(pgValue, defaultValue)) {
        neFields.push(f)
      }
    }
  }

  return neFields
}

function addNeFieldsToErrors(
  errors: IError,
  neFields: string[],
  rethinkRow: RethinkDoc,
  pgRow: PGDoc,
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

export async function checkTableEq(
  rethinkQuery: RTable<TableSchema>,
  pgQuery: (ids: string[]) => Promise<PGDoc[]>,
  alwaysDefinedFields: string[],
  maybeUndefinedFieldsDefaultValues: {[key: string]: any},
  maxErrors: number = 10
): Promise<IError> {
  const errors : IError = {
    recordsCompared: 0,
    foundErrors: 0
  }
  const batchSize = 3000

  for (let i = 0; i < 1e5; i++) {
    console.log(i)
    const offset = batchSize * i
    const rethinkRows = (await rethinkQuery
      .skip(offset)
      .limit(batchSize)
      .run()) as RethinkDoc[]
    if (!rethinkRows.length) {
      break
    }

    const ids = rethinkRows.map((t) => t.id)
    const pgRows = await pgQuery(ids)
    const pgRowsById = {} as {[key: string]: PGDoc}
    pgRows.forEach((pgRow) => {
      pgRowsById[pgRow.id] = pgRow
    })

    for (const rethinkRow of rethinkRows) {
      const id = rethinkRow.id
      const pgRow = pgRowsById[id]
      errors.recordsCompared += 1

      if (!pgRow) {
        errors[id] = {
          error: 'No pg row found for rethink row'
        }
        errors.foundErrors += 1
        if (errors.foundErrors === maxErrors) {
          return errors
        }
        continue
      }
      const neFields = getPairNeFields(
        rethinkRow,
        pgRow,
        alwaysDefinedFields,
        maybeUndefinedFieldsDefaultValues
      )

      if (neFields.length) {
        addNeFieldsToErrors(errors, neFields, rethinkRow, pgRow, id)
        errors.foundErrors += 1
        if (errors.foundErrors === maxErrors) {
          return errors
        }
      }
    }
  }

  return errors
}
