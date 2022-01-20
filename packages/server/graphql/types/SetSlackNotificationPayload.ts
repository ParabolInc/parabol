import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import User from './User'
import SlackNotification from './SlackNotification'
import {GQLContext} from '../graphql'

const SetSlackNotificationPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'SetSlackNotificationPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    slackNotifications: {
      type: new GraphQLList(new GraphQLNonNull(SlackNotification)),
      resolve: async ({slackNotificationIds}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('slackNotifications').loadMany(slackNotificationIds)
      }
    },
    user: {
      type: User,
      description: 'The user with updated slack notifications',
      resolve: ({userId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

export default SetSlackNotificationPayload
