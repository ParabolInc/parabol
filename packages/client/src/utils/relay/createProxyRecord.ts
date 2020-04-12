// const isRelayScalarValue = (val) => {
//  return (typeof val !== 'object');
// };
//
// const getSetMethod = (val) => {
//  if (isRelayScalarValue(val)) return 'setValue';
//  if (Array.isArray(val)) {
//    return isRelayScalarValue(val[0]) ? 'setValue' : 'setLinkedRecords';
//  }
//  return 'setLinkedRecord';
// };

import {RecordProxy, RecordSourceProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import clientTempId from './clientTempId'

// interface PRecord {
//   // id?: string,
//   [key: string]: any
// }

const createProxyRecord = <T, N extends string>(
  store: RecordSourceSelectorProxy<any> | RecordSourceProxy,
  type: N,
  record: T
): RecordProxy<T & {__typename: N}> => {
  // @ts-ignore
  const id = record.id || clientTempId()
  const newRecord = store.create(id, type)
  // default to this
  newRecord.setValue(id, 'id')
  const keys = Object.keys(record)
  for (let ii = 0; ii < keys.length; ii++) {
    const key = keys[ii]
    const val = record[key]
    // const setMethod = getSetMethod(val);
    newRecord.setValue(val, key)
  }
  // @ts-ignore
  return newRecord
}

export default createProxyRecord
