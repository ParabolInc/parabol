type FilterFn = (predicate: any) => boolean | null | undefined | void
type Options = {
  isPlural: boolean
}

type Record = {
  __id: string
  __typename: string
  [field: string]: any
}

const getCachedRecord = (
  store: any,
  filterFn: FilterFn,
  options: Options = {isPlural: false}
): Array<Record> | Record => {
  const records = store.__recordSource.__mutator._base._records
  const keys = Object.keys(records)
  const filteredRecords: Array<Record> = []
  for (let ii = 0; ii < keys.length; ii++) {
    const key = keys[ii]
    const record = records[key]
    if (filterFn(record)) {
      if (!options.isPlural) return record
      filteredRecords.push(record)
    }
  }
  return filteredRecords
}

export default getCachedRecord
