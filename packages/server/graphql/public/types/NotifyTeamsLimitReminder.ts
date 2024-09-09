import {NotifyTeamsLimitReminderResolvers} from '../resolverTypes'

const NotifyTeamsLimitReminder: NotifyTeamsLimitReminderResolvers = {
  __isTypeOf: ({type}) => type === 'TEAMS_LIMIT_REMINDER',
  orgPicture: async ({orgPicture}, _args, {dataLoader}) => {
    if (!orgPicture) return null
    return dataLoader.get('fileStoreAsset').load(orgPicture)
  }
}

export default NotifyTeamsLimitReminder
