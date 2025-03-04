import {SetTeamNotificationSettingSuccessResolvers} from '../resolverTypes'

export type SetTeamNotificationSettingSuccessSource = {
  // db id
  id: number
}

const SetTeamNotificationSettingSuccess: SetTeamNotificationSettingSuccessResolvers = {
  teamNotificationSettings: async (source, _args, {dataLoader}) => {
    const {id} = source
    const settings = await dataLoader.get('teamNotificationSettings').loadNonNull(id)
    return settings
  }
}

export default SetTeamNotificationSettingSuccess
