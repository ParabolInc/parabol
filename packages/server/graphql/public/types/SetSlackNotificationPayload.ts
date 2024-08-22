import isValid from '../../isValid'
import {SetSlackNotificationPayloadResolvers} from '../resolverTypes'

export type SetSlackNotificationPayloadSource =
  | {
      slackNotificationIds: string[]
      userId: string
    }
  | {error: {message: string}}

const SetSlackNotificationPayload: SetSlackNotificationPayloadResolvers = {
  slackNotifications: async (source, _args, {dataLoader}) => {
    return 'slackNotificationIds' in source
      ? (await dataLoader.get('slackNotifications').loadMany(source.slackNotificationIds)).filter(
          isValid
        )
      : null
  },

  user: (source, _args, {dataLoader}) => {
    return 'userId' in source ? dataLoader.get('users').loadNonNull(source.userId) : null
  }
}

export default SetSlackNotificationPayload
