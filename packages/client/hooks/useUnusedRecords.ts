import {useMemo} from 'react'

const useUnusedRecords = (
  records: ReadonlyArray<{readonly node: {readonly id: string}}>,
  usedRecordIds: Set<string>
): [string[], boolean | null] => {
  return useMemo(() => {
    const unusedRecords = [] as string[]
    records.forEach(({node}) => {
      if (!usedRecordIds.has(node.id)) unusedRecords.push(node.id)
    })
    const selectAll =
      unusedRecords.length === 0 ? true : unusedRecords.length === records.length ? false : null
    return [unusedRecords, selectAll]
  }, [records, usedRecordIds])
}

export default useUnusedRecords
