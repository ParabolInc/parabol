import graphQLSubscriptionType from 'server/graphql/graphQLSubscriptionType'
import AddProviderPayload from 'server/graphql/types/AddProviderPayload'
import RemoveProviderPayload from 'server/graphql/types/RemoveProviderPayload'

const types = [AddProviderPayload, RemoveProviderPayload]

export default graphQLSubscriptionType('IntegrationSubscriptionPayload', types)
