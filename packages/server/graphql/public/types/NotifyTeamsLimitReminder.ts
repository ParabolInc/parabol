import {NotifyTeamsLimitReminderResolvers} from '../resolverTypes'

const NotifyTeamsLimitReminder: NotifyTeamsLimitReminderResolvers = {
  __isTypeOf: ({type}) => type === 'TEAMS_LIMIT_REMINDER',
  organization: ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').load(orgId)
  }
}

export default NotifyTeamsLimitReminder
