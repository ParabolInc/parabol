type FilterFn = (record: Record) => boolean | null | undefined | void
interface Options {
  isPlural: boolean
}

interface Record {
  __id: string
  __typename: string
  [field: string]: any
}

/*
 * Goes through the sink, then the base looking for 1 or more records that match the filterFn
 * */

// overloading the function because return type is guaranteed based on options
function getCachedRecord(
  store: any,
  filterFn: FilterFn,
  options?: {isPlural: false} & Options
): Record
function getCachedRecord(
  store: any,
  filterFn: FilterFn,
  options: {isPlural: true} & Options
): Record[]
function getCachedRecord(
  store: any,
  filterFn: FilterFn,
  options: Options = {isPlural: false}
): Record[] | Record {
  const sources = store.__recordSource.__mutator.__sources
  const filteredRecords: Record[] = []
  for (let ss = 0; ss < sources.length; ss++) {
    const source = sources[ss]
    const records = source._records
    const keys = Object.keys(records)
    for (let ii = 0; ii < keys.length; ii++) {
      const key = keys[ii]
      const record = records[key]
      if (filterFn(record)) {
        if (!options.isPlural) return record
        filteredRecords.push(record)
      }
    }
  }
  return filteredRecords
}

export default getCachedRecord
