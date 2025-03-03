import {UpdateTeamNotificationSettingSuccessResolvers} from '../resolverTypes'

export type UpdateTeamNotificationSettingSuccessSource = {
  // db id
  id: number
}

const UpdateTeamNotificationSettingSuccess: UpdateTeamNotificationSettingSuccessResolvers = {
  teamNotificationSettings: async (source, _args, {dataLoader}) => {
    const {id} = source
    const settings = await dataLoader.get('teamNotificationSettings').loadNonNull(id)
    return settings
  }
}

export default UpdateTeamNotificationSettingSuccess
