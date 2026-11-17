import type {SetNotificationStatusPayloadResolvers} from '../resolverTypes'

export type SetNotificationStatusPayloadSource = {notificationId: string}

const SetNotificationStatusPayload: SetNotificationStatusPayloadResolvers = {
  notification: (source, _args, {dataLoader}) => {
    return dataLoader.get('notifications').loadNonNull(source.notificationId)
  }
}

export default SetNotificationStatusPayload
