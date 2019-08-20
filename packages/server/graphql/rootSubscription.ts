import {GraphQLObjectType} from 'graphql'
import notificationSubscription from './subscriptions/notificationSubscription'
import organizationSubscription from './subscriptions/organizationSubscription'
import taskSubscription from './subscriptions/taskSubscription'
import teamSubscription from './subscriptions/teamSubscription'

export default new GraphQLObjectType({
  name: 'Subscription',
  fields: () => ({
    notificationSubscription,
    organizationSubscription,
    taskSubscription,
    teamSubscription
  })
})
