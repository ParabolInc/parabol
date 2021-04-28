import {RTable, TableSchema} from '../../database/stricterR'
import areEqual from 'fbjs/lib/areEqual'
import getPg from '../getPg'

interface DBDoc {
  id: string
  [key: string]: any
}
interface RethinkDoc extends DBDoc {}
interface PGDoc extends DBDoc {}

interface IError {
  [key: string]:
    | {
        error: string[]
        rethinkRow: Partial<RethinkDoc>
        pgRow: Partial<PGDoc>
      }
    | number
    | undefined
    | string[]
  rethinkRecordsCompared: number
  foundErrors: number
  missingPgRows: string[]
  extraPgRows: string[]
  rethinkRowCount?: number
  pgRowCount?: number
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

const getExtraPgRowIds = async (tableName: string): Promise<string[]> => {
  const pg = getPg()
  const queryRes = await pg.query(`
    SELECT ARRAY_AGG("id") FROM "${tableName}"
      WHERE "eqChecked" = '-infinity'::timestamptz;
  `)
  return queryRes.rows[0].array_agg
}

export async function checkTableEq(
  tableName: string,
  rethinkQuery: RTable<TableSchema>,
  pgQuery: (
    update: {
      [key: string]: any
      eqChecked: Date
    },
    ids: string[]
  ) => Promise<PGDoc[]>,
  alwaysDefinedFields: string[],
  maybeUndefinedFieldsDefaultValues: {[key: string]: any},
  maxErrors = 10
): Promise<IError> {
  const errors: IError = {
    rethinkRecordsCompared: 0,
    foundErrors: 0,
    missingPgRows: [],
    extraPgRows: []
  }
  const batchSize = 3000

  for (let i = 0; i < 1e5; i++) {
    if (errors.foundErrors === maxErrors) {
      return errors
    }

    const offset = batchSize * i
    const rethinkRows = (await rethinkQuery
      .skip(offset)
      .limit(batchSize)
      .run()) as RethinkDoc[]
    if (!rethinkRows.length) {
      break
    }

    const ids = rethinkRows.map((t) => t.id)
    const pgRows = await pgQuery({eqChecked: new Date()}, ids)
    const pgRowsById = {} as {[key: string]: PGDoc}
    pgRows.forEach((pgRow) => {
      pgRowsById[pgRow.id] = pgRow
    })

    for (const rethinkRow of rethinkRows) {
      if (errors.foundErrors === maxErrors) {
        return errors
      }
      errors.rethinkRecordsCompared += 1
      const id = rethinkRow.id
      const pgRow = pgRowsById[id]

      if (!pgRow) {
        errors.missingPgRows.push(id)
        errors.foundErrors += 1
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
      }
    }
  }
  errors.rethinkRowCount = errors.rethinkRecordsCompared
  errors.extraPgRows = await getExtraPgRowIds(tableName)
  errors.foundErrors += errors.extraPgRows.length
  errors.pgRowCount =
    errors.rethinkRowCount - errors.missingPgRows.length + errors.extraPgRows.length
  return errors
}
