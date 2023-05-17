import {RouterProps} from 'react-router'
import Atmosphere from '../Atmosphere'
import {OnNextHandler} from '../types/relayMutations'

const subscriptionOnNext =
  (
    subscriptionName: string,
    onNextHandlers: Record<string, OnNextHandler<any, any>>,
    atmosphere: Atmosphere,
    router: {history: RouterProps['history']}
  ) =>
  (result: any) => {
    if (!result) return
    const payload = result[subscriptionName]
    if (!payload) return
    const {fieldName} = payload
    const field = payload[fieldName]
    if (!field) {
      /* this happens when an onNextHandler exists
      but there is no matching fragment in the GQL subscription query. */
      console.error('Notification Subscription Payload received without field:', fieldName)
    }
    const handler = onNextHandlers[fieldName]
    handler?.(field, {...router, atmosphere})
  }

export default subscriptionOnNext
