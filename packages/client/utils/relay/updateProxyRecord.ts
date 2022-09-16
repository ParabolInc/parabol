import {RecordProxy} from 'relay-runtime'
import {Primitive} from 'relay-runtime/lib/store/RelayStoreTypes'

const updateProxyRecord = (proxyRecord: RecordProxy, updatedRecord: Record<string, Primitive>) => {
  const keys = Object.keys(updatedRecord)
  for (let ii = 0; ii < keys.length; ii++) {
    const key = keys[ii]!
    const val = updatedRecord[key as keyof typeof updatedRecord]
    proxyRecord.setValue(val, key)
  }
}

export default updateProxyRecord
