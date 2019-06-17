import {GraphQLObjectType} from 'graphql'
import newAuthToken from 'server/graphql/subscriptions/newAuthToken'
import notificationSubscription from 'server/graphql/subscriptions/notificationSubscription'
import organizationSubscription from 'server/graphql/subscriptions/organizationSubscription'
import taskSubscription from 'server/graphql/subscriptions/taskSubscription'
import teamMemberSubscription from 'server/graphql/subscriptions/teamMemberSubscription'
import teamSubscription from 'server/graphql/subscriptions/teamSubscription'

export default new GraphQLObjectType({
  name: 'Subscription',
  fields: () => ({
    newAuthToken,
    notificationSubscription,
    organizationSubscription,
    taskSubscription,
    teamSubscription,
    teamMemberSubscription
  })
})
