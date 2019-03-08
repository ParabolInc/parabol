import {graphql} from 'react-relay'
import {addProviderIntegrationUpdater} from 'universal/mutations/AddProviderMutation'
import {removeProviderIntegrationUpdater} from 'universal/mutations/RemoveProviderMutation'

const subscription = graphql`
  subscription IntegrationSubscription($teamId: ID!) {
    integrationSubscription(teamId: $teamId) {
      __typename
      ...AddProviderMutation_integration @relay(mask: false)
      ...RemoveProviderMutation_integration @relay(mask: false)
    }
  }
`
const updaters = {
  AddProviderPayload: addProviderIntegrationUpdater,
  RemoveProviderPayload: removeProviderIntegrationUpdater
}
const onNextHandlers = {}

const IntegrationSubscription = (atmosphere, _queryVariables, subParams) => {
  const {history, teamId} = subParams
  const context = {atmosphere, history, teamId}
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const payload = store.getRootField('integrationSubscription')
      if (!payload) return
      const type = payload.getValue('__typename')
      const updater = updaters[type]
      updater && updater(payload, store, context)
    },
    onNext: ({integrationSubscription}) => {
      const {__typename: type} = integrationSubscription
      const handler = onNextHandlers[type]
      if (handler) {
        handler(integrationSubscription, context)
      }
    }
  }
}

export default IntegrationSubscription
