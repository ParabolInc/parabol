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
    | boolean
    | undefined
    | string[]
  rethinkRecordsCompared: number
  foundErrors: number
  missingPgRows: string[]
  rethinkRowCount?: number
  pgRowCount?: number
  areRowCountsEqual?: boolean
}

function getPairNeFields(
  rethinkRow: RethinkDoc,
  pgRow: PGDoc,
  alwaysDefinedFields: string[],
  maybeUndefinedFieldsDefaultValues: {[key: string]: any},
  maybeNullFieldsDefaultValues?: {[key: string]: any}
): string[] {
  const neFields = [] as string[]

  for (const f of alwaysDefinedFields) {
    const [rethinkValue, pgValue] = [rethinkRow[f], pgRow[f]]
    if (!areEqual(rethinkValue, pgValue)) {
      neFields.push(f)
    }
  }
  for (const [maybeUndefinedField, defaultValueForUndefinedField] of Object.entries(
    maybeUndefinedFieldsDefaultValues
  )) {
    const [rethinkValue, pgValue] = [rethinkRow[maybeUndefinedField], pgRow[maybeUndefinedField]]

    if (rethinkValue === undefined) {
      if (areEqual(pgValue, defaultValueForUndefinedField)) {
        continue
      }
    } else if (rethinkValue === null && pgValue !== null) {
      if (
        maybeNullFieldsDefaultValues &&
        areEqual(maybeNullFieldsDefaultValues[maybeUndefinedField], pgValue)
      ) {
        continue
      }
    } else if (areEqual(pgValue, rethinkValue)) {
      continue
    }

    neFields.push(maybeUndefinedField)
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
  const rethinkNeFields = {} as Record<string, any>
  const pgNeFields = {} as Record<string, any>
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

const getPgRowCount = async (tableName: string) => {
  const pg = getPg()
  const queryRes = await pg.query(`
    SELECT COUNT(*) FROM "${tableName}";
  `)
  return Number(queryRes.rows[0].count)
}

export async function checkTableEq(
  tableName: string,
  rethinkQuery: RTable<TableSchema>,
  pgQuery: (ids: string[]) => Promise<PGDoc[] | null>,
  alwaysDefinedFields: string[],
  maybeUndefinedFieldsDefaultValues: {[key: string]: any},
  maybeNullFieldsDefaultValues: {[key: string]: any},
  maxErrors = 10
): Promise<IError> {
  const errors: IError = {
    rethinkRecordsCompared: 0,
    foundErrors: 0,
    missingPgRows: []
  }
  const batchSize = 3000

  for (let i = 0; i < 1e5; i++) {
    if (errors.foundErrors >= maxErrors) {
      return errors
    }

    const offset = batchSize * i
    const rethinkRows = (await rethinkQuery.skip(offset).limit(batchSize).run()) as RethinkDoc[]
    if (!rethinkRows.length) {
      break
    }

    const ids = rethinkRows.map((t) => t.id)
    const pgRows = (await pgQuery(ids)) ?? []
    const pgRowsById = {} as {[key: string]: PGDoc}
    pgRows.forEach((pgRow) => {
      pgRowsById[pgRow.id] = pgRow
    })

    for (const rethinkRow of rethinkRows) {
      if (errors.foundErrors >= maxErrors) {
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
        maybeUndefinedFieldsDefaultValues,
        maybeNullFieldsDefaultValues
      )

      if (neFields.length) {
        addNeFieldsToErrors(errors, neFields, rethinkRow, pgRow, id)
        errors.foundErrors += 1
      }
    }
  }
  errors.rethinkRowCount = errors.rethinkRecordsCompared
  errors.pgRowCount = await getPgRowCount(tableName)
  errors.areRowCountsEqual = errors.rethinkRowCount === errors.pgRowCount
  return errors
}
