interface RemovalFilter {
  [parentType: string]: string[]
}

/*
 * After using store.delete(), arrays that contained the deleted node will contain null
 * this goes through the whole cache & removes those
 * */

const removeFromRefs = (promptId: string, store: any, removalFilter?: RemovalFilter) => {
  const sources = store.__recordSource.__mutator.__sources
  for (let ii = 0; ii < sources.length; ii++) {
    const source = sources[ii]
    const records = source._records
    const keys = Object.keys(records)
    for (let jj = 0; jj < keys.length; jj++) {
      const key = keys[jj]
      const record = records[key]
      if (!record) continue
      if (removalFilter && !removalFilter[record.__typename]) continue
      const fieldFilters = removalFilter && removalFilter[record.__typename]
      const fields = Object.keys(record)
      for (let kk = 0; kk < fields.length; kk++) {
        const fieldName = fields[kk]
        if (fieldFilters && !fieldFilters.includes(fieldName)) continue
        const field = record[fieldName]
        if (!field.__refs) continue
        const idx = field.__refs.indexOf(promptId)
        if (idx === -1) continue
        const proxyRecord = store.get(record.__id)
        // no need to handle args since they are built into the name we grab
        const arr = proxyRecord.getLinkedRecords(fieldName)
        const newArr = [...arr.slice(0, idx), ...arr.slice(idx + 1)]
        proxyRecord.setLinkedRecords(newArr, fieldName)
      }
    }
  }
}

export default removeFromRefs
