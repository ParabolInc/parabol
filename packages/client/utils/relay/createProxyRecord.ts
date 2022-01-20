import {RecordProxy, RecordSourceProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import {Primitive} from 'relay-runtime/lib/store/RelayStoreTypes'
import clientTempId from './clientTempId'

const createProxyRecord = <
  T extends {
    id?: string
    [key: string]: Primitive | Primitive[]
  },
  N extends string
>(
  store: RecordSourceSelectorProxy<any> | RecordSourceProxy,
  type: N,
  record: T
) => {
  const id = record.id || clientTempId()
  const newRecord = store.create(id, type)
  newRecord.setValue(id, 'id')
  for (const [key, val] of Object.entries(record)) {
    // It's impossible to handle setLinkedRecords for empty arrays because we can't determine if it's a value or a link
    newRecord.setValue(val, key)
  }
  return newRecord as RecordProxy<T & {__typename: N; id: string}>
}

export default createProxyRecord
