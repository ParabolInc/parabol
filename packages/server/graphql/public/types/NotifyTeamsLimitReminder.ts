import {NotifyTeamsLimitReminderResolvers} from '../resolverTypes'

const NotifyTeamsLimitReminder: NotifyTeamsLimitReminderResolvers = {
  __isTypeOf: ({type}) => type === 'TEAMS_LIMIT_REMINDER'
}

export default NotifyTeamsLimitReminder
