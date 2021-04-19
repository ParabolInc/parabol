import {RTable, TableSchema} from '../../database/stricterR'
import lodash from 'lodash'

type WithId<T> = T & {id: string}

export type CustomResolver = (rethinkValue: string, pgValue: string) => boolean

export type AlwaysDefinedFieldsCustomResolvers<rethinkType> = {
  [Property in keyof Partial<rethinkType>]: CustomResolver | undefined
}

export type MaybeUndefinedFieldsCustomResolversDefaultValues<rethinkType> = {
  [Property in keyof Partial<rethinkType>]: [CustomResolver | undefined, any]
}

interface IError<rethinkType, pgType> {
  [key: string]:
    | {
        error: string | string[]
        rethinkRow?: Partial<rethinkType>
        pgRow?: Partial<pgType>
      }
    | number
  recordsCompared: number
}

function getPairNeFields<rethinkType, pgType>(
  rethinkUser: rethinkType,
  pgUser: pgType,
  alwaysDefinedFieldsCustomResolvers: AlwaysDefinedFieldsCustomResolvers<rethinkType>,
  maybeUndefinedFieldsCustomResolversDefaultValues: MaybeUndefinedFieldsCustomResolversDefaultValues<
    rethinkType
  >
): string[] {
  const neFields = [] as string[]

  for (const [f, customResolver] of Object.entries(alwaysDefinedFieldsCustomResolvers)) {
    const [rethinkValue, pgValue] = [rethinkUser[f], pgUser[f]]
    if (!lodash.isEqualWith(rethinkValue, pgValue, customResolver as CustomResolver)) {
      neFields.push(f)
    }
  }
  for (const [f, tuple] of Object.entries(maybeUndefinedFieldsCustomResolversDefaultValues)) {
    const [customResolver, defaultValue] = tuple as [CustomResolver, any]
    const [rethinkValue, pgValue] = [rethinkUser[f], pgUser[f]]
    if (!lodash.isUndefined(rethinkValue)) {
      if (!lodash.isEqualWith(rethinkValue, pgValue, customResolver)) {
        neFields.push(f)
      }
    } else {
      if (!lodash.isEqual(pgValue, defaultValue)) {
        neFields.push(f)
      }
    }
  }

  return neFields
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
  alwaysDefinedFieldsCustomResolvers: AlwaysDefinedFieldsCustomResolvers<rethinkType>,
  maybeUndefinedFieldsCustomResolversDefaultValues: MaybeUndefinedFieldsCustomResolversDefaultValues<
    rethinkType
  >,
  batchSize = 3000,
  startPage = 0
): Promise<IError<rethinkType, pgType>> {
  const errors = {} as IError<rethinkType, pgType>
  const offset = batchSize * startPage
  const rethinkRows = (await rethinkQuery
    .skip(offset)
    .limit(batchSize)
    .run()) as rethinkType[]

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
    const neFields = getPairNeFields<rethinkType, pgType>(
      rethinkRow,
      pgRow,
      alwaysDefinedFieldsCustomResolvers,
      maybeUndefinedFieldsCustomResolversDefaultValues
    )
    if (neFields.length) {
      addNeFieldsToErrors<rethinkType, pgType>(errors, neFields, rethinkRow, pgRow, id)
    }
  }
  errors.recordsCompared = rethinkRows.length
  return errors
}
