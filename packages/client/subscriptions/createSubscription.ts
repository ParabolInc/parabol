import type {RouterProps} from 'react-router'
import {ConcreteRequest, GraphQLTaggedNode, OperationType, requestSubscription} from 'relay-runtime'
import type Atmosphere from '../Atmosphere'
import {OnNextHandler, SharedUpdater} from '../types/relayMutations'
import subscriptionOnNext from './subscriptionOnNext'
import subscriptionUpdater from './subscriptionUpdater'

export const createSubscription = <TSubscription extends OperationType>(
  subscription: GraphQLTaggedNode,
  onNextHandlers: Record<string, OnNextHandler<any, any>>,
  updateHandlers: Record<string, SharedUpdater<any>>
) => {
  const name = (subscription as ConcreteRequest).operation.name
  if (!name) throw new Error('Subscription must have a name')

  const namedAndRegisteredSubscription = (
    atmosphere: Atmosphere,
    variables: TSubscription['variables'],
    router: {history: RouterProps['history']}
  ) => {
    const fieldName = atmosphere.registerSubscription(subscription)
    return requestSubscription<TSubscription>(atmosphere, {
      subscription,
      variables,
      updater: subscriptionUpdater(fieldName, updateHandlers, atmosphere),
      onNext: subscriptionOnNext(fieldName, onNextHandlers, atmosphere, router),
      onCompleted: () => {
        atmosphere.unregisterSub(name, variables)
      }
    })
  }
  namedAndRegisteredSubscription.key = name
  return namedAndRegisteredSubscription
}
