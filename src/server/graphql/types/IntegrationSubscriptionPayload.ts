import graphQLSubscriptionType from 'server/graphql/graphQLSubscriptionType'
import AddProviderPayload from 'server/graphql/types/AddProviderPayload'

const types = [AddProviderPayload]

export default graphQLSubscriptionType('IntegrationSubscriptionPayload', types)
