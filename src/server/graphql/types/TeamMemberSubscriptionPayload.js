import graphQLSubscriptionType from 'server/graphql/graphQLSubscriptionType'
import UpdateUserProfilePayload from 'server/graphql/types/UpdateUserProfilePayload'

const types = [UpdateUserProfilePayload]

export default graphQLSubscriptionType('TeamMemberSubscriptionPayload', types)
