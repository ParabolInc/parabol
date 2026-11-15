import type {RecordSourceSelectorProxy} from 'relay-runtime'
import type Atmosphere from '../Atmosphere'
import type {SharedUpdater} from '../types/relayMutations'

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
    // the server nulls a payload it failed to resolve
    if (!field) {
      console.error('Notification Subscription Payload received without field:', fieldName)
      return
    }
    const handler = updateHandlers[fieldName]
    handler?.(field, {atmosphere, store})
  }

export default subscriptionUpdater
