/* Gets a scalar by deeply traversing a proxy of linkedRecords. */

import {RecordProxy} from 'relay-runtime'

const getInProxyObj = (payload: RecordProxy, path: string[]) => {
  let record = payload
  for (let ii = 0; ii < path.length - 1; ii++) {
    record = record.getLinkedRecord(path[ii]!)
    if (!record) return record
  }
  // the last thing has to be a scalar
  const lastValue = path[path.length - 1]
  return record.getValue(lastValue!)
}

const getInProxy = (payload, ...path: string[]) => {
  if (!payload) return payload
  if (Array.isArray(payload)) {
    return payload.map((child) => getInProxyObj(child, path))
  }
  return getInProxyObj(payload, path)
}

export default getInProxy
