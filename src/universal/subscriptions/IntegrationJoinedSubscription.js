import {joinIntegrationUpdater} from 'universal/mutations/JoinIntegrationMutation'

const subscription = graphql`
  subscription IntegrationJoinedSubscription($service: IntegrationServiceEnum!, $teamId: ID!) {
    integrationJoined(service: $service, teamId: $teamId) {
      globalId
      teamMember {
        id
        picture
        preferredName
      }
    }
  }
`

const IntegrationJoinedSubscription = (service) => (environment, queryVariables) => {
  const {viewerId} = environment
  const {teamId} = queryVariables
  return {
    subscription,
    variables: {service, teamId},
    updater: (store) => {
      const viewer = store.get(viewerId)
      const payload = store.getRootField('integrationJoined')
      if (!payload) return
      joinIntegrationUpdater(store, viewer, teamId, payload)
    }
  }
}

export default IntegrationJoinedSubscription
