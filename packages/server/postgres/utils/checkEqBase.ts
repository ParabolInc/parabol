export type CustomResolver = (rethinkValue: string, pgValue: string) => boolean
export type IAlwaysDefinedFieldsCustomResolvers<T> = {
  [Property in keyof Partial<T>]: CustomResolver | undefined
}
export type IMaybeUndefinedFieldsDefaultValues<T> = {
  [Property in keyof Partial<T>]: any
}
export interface IError<rethinkType, pgType> {
  [key: string]: {
    error: string | string[]
    rethinkRow?: Partial<rethinkType>
    pgRow?: Partial<pgType>
  }
}
export type AddNeFieldToErrors<rethinkType, pgType> = (
  errors: IError<rethinkType, pgType>,
  neField: string,
  rethinkRow: rethinkType,
  pgRow: pgType
) => void

export const addNeFieldToErrors = (errors, neField, rethinkRow, pgRow) => {
  const id = rethinkRow.id
  const prevErrorEntry = errors[id] ?? {
    error: [],
    rethinkRow: {},
    pgRow: {}
  }
  errors[id] = {
    error: [...prevErrorEntry.error, neField],
    rethinkRow: {
      ...prevErrorEntry.rethinkRow,
      [neField]: rethinkRow[neField]
    },
    pgRow: {
      ...prevErrorEntry.pgRow,
      [neField]: pgRow[neField]
    }
  }
}
