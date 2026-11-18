import type Atmosphere from '../Atmosphere'
import type {NavigateFn, OnNextHandler} from '../types/relayMutations'
import logMissingSubscriptionField from './logMissingSubscriptionField'

const subscriptionOnNext =
  (
    subscriptionName: string,
    onNextHandlers: Record<string, OnNextHandler<any, any>>,
    atmosphere: Atmosphere,
    router: {navigate: NavigateFn}
  ) =>
  (result: any) => {
    if (!result) return
    const payload = result[subscriptionName]
    if (!payload) return
    const {fieldName} = payload
    const field = payload[fieldName]
    if (!field) {
      logMissingSubscriptionField(fieldName)
      return
    }
    const handler = onNextHandlers[fieldName]
    handler?.(field, {...router, atmosphere})
  }

export default subscriptionOnNext
