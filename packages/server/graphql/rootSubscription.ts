import {GraphQLObjectType} from 'graphql'
import newAuthToken from './subscriptions/newAuthToken'
import notificationSubscription from './subscriptions/notificationSubscription'
import organizationSubscription from './subscriptions/organizationSubscription'
import taskSubscription from './subscriptions/taskSubscription'
import teamSubscription from './subscriptions/teamSubscription'

export default new GraphQLObjectType({
  name: 'Subscription',
  fields: () => ({
    newAuthToken,
    notificationSubscription,
    organizationSubscription,
    taskSubscription,
    teamSubscription
  })
})
