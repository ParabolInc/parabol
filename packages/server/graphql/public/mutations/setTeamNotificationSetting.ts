import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import TeamNotificationSettingsId from '../../../../client/shared/gqlIds/TeamNotificationSettingsId'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const setTeamNotificationSetting: MutationResolvers['setTeamNotificationSetting'] = async (
  _source,
  {id: gqlId, event, isEnabled},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const pg = getKysely()
  const id = TeamNotificationSettingsId.split(gqlId)

  // AUTH
  const setting = await dataLoader.get('teamNotificationSettings').load(id)
  if (!setting) {
    return standardError(new Error('TeamNotificationSetting not found'), {userId: viewerId})
  }
  const {teamId} = setting
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
  }

  // RESOLUTION
  if (isEnabled) {
    await pg
      .updateTable('TeamNotificationSettings')
      .set(({fn, val}) => ({
        events: fn('arr_append_uniq', ['events', val(event)])
      }))
      .where('id', '=', id)
      .execute()
  } else {
    await pg
      .updateTable('TeamNotificationSettings')
      .set(({fn, val}) => ({
        events: fn('array_remove', ['events', val(event)])
      }))
      .where('id', '=', id)
      .execute()
  }
  // update dataLoader
  setting.events = isEnabled
    ? [...setting.events, event]
    : setting.events.filter((e: any) => e !== event)

  const data = {id}
  publish(SubscriptionChannel.TEAM, teamId, 'SetNotificationSettingSuccess', data, subOptions)
  return data
}

export default setTeamNotificationSetting
