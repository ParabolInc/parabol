import {RecordSourceSelectorProxy} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {SharedUpdater} from '../types/relayMutations'

const subscriptionUpdater =
  (
    subscriptionName: string,
    updateHandlers: Record<string, SharedUpdater<any>>,
    atmosphere: Atmosphere
  ) =>
  (store: RecordSourceSelectorProxy<any>) => {
    const payload = store.getRootField(subscriptionName)
    if (!payload) return
    const fieldName = payload.getValue('fieldName')
    const field = payload.getLinkedRecord(fieldName)
    const handler = updateHandlers[fieldName]
    handler?.(field, {atmosphere, store})
  }

export default subscriptionUpdater
