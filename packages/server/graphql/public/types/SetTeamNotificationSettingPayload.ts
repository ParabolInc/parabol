import type {SetTeamNotificationSettingPayloadResolvers} from '../resolverTypes'

export type SetTeamNotificationSettingPayloadSource = {
  // db id
  id: number
}

const SetTeamNotificationSettingPayload: SetTeamNotificationSettingPayloadResolvers = {
  teamNotificationSettings: async (source, _args, {dataLoader}) => {
    const {id} = source
    const settings = await dataLoader.get('teamNotificationSettings').loadNonNull(id)
    return settings
  }
}

export default SetTeamNotificationSettingPayload
