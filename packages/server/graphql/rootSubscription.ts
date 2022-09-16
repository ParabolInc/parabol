import {GraphQLObjectType} from 'graphql'
import {GQLContext} from './graphql'
import meetingSubscription from './subscriptions/meetingSubscription'
import notificationSubscription from './subscriptions/notificationSubscription'
import organizationSubscription from './subscriptions/organizationSubscription'
import taskSubscription from './subscriptions/taskSubscription'
import teamSubscription from './subscriptions/teamSubscription'

export default new GraphQLObjectType<any, GQLContext>({
  name: 'Subscription',
  fields: () =>
    ({
      meetingSubscription,
      notificationSubscription,
      organizationSubscription,
      taskSubscription,
      teamSubscription
    } as any)
})
