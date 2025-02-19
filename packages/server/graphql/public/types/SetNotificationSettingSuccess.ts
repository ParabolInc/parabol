import {SetNotificationSettingSuccessResolvers} from '../resolverTypes'

export type SetNotificationSettingSuccessSource = {
  authId: number
  providerId: number
  teamId: string
}

const SetNotificationSettingSuccess: SetNotificationSettingSuccessResolvers = {
  auth: async ({authId}, _args, {dataLoader}) => {
    return dataLoader.get('teamMemberIntegrationAuths').loadNonNull(authId)
  },
  events: async ({providerId, teamId}, _args, {dataLoader}) => {
    return dataLoader.get('notificationSettingsByProviderIdAndTeamId').load({providerId, teamId})
  }
}

export default SetNotificationSettingSuccess
