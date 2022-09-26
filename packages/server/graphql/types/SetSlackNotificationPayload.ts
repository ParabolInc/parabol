import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import SlackNotification from './SlackNotification'
import StandardMutationError from './StandardMutationError'
import User from './User'

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
