import {SetNotificationSettingSuccessResolvers} from '../resolverTypes'

export type SetNotificationSettingSuccessSource = {
  authId: number
}

const SetNotificationSettingSuccess: SetNotificationSettingSuccessResolvers = {
  auth: async ({authId}, _args, {dataLoader}) => {
    return dataLoader.get('teamMemberIntegrationAuths').loadNonNull(authId)
  },
  events: async ({authId}, _args, {dataLoader}) => {
    return dataLoader.get('notificationSettingsByAuthId').load(authId)
  }
}

export default SetNotificationSettingSuccess
