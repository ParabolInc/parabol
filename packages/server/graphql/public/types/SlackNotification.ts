import {slackNotificationEventTypeLookup} from '../../../database/types/SlackNotification'
import {SlackNotificationResolvers} from '../resolverTypes'

const SlackNotification: SlackNotificationResolvers = {
  eventType: ({event}) => {
    return slackNotificationEventTypeLookup[event]
  }
}

export default SlackNotification
