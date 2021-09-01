// This is a required workaround to flag the clientFields as available for subsequent availability checks
// Without this, the queries would have to always reach out to the network to fetch

import {Handler} from 'relay-runtime/lib/store/RelayStoreTypes'

const initHandler: Handler['update'] = (store, payload) => {
  const {dataID, handleKey} = payload
  const record = store.get(dataID)
  if (!record) return
  const handleKeyValue = record.getValue(handleKey)
  if (handleKeyValue === undefined) {
    record.setValue(null, handleKey)
  }
}

export default initHandler
