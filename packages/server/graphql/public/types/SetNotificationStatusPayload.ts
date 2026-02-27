import type {SetNotificationStatusPayloadResolvers} from '../resolverTypes'

export type SetNotificationStatusPayloadSource =
  | {notificationId: string}
  | {error: {message: string}}

const SetNotificationStatusPayload: SetNotificationStatusPayloadResolvers = {
  notification: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('notifications').loadNonNull(source.notificationId)
  }
}

export default SetNotificationStatusPayload
