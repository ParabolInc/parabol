import TeamNotificationSettingsId from '../../../../client/shared/gqlIds/TeamNotificationSettingsId'
import {isNotNull} from '../../../../client/utils/predicates'
import getKysely from '../../../postgres/getKysely'
import type {MutationResolvers} from '../resolverTypes'

const unlinkMattermostChannel: MutationResolvers['unlinkMattermostChannel'] = async (
  _source,
  {teamId, channelId},
  context
) => {
  const {dataLoader} = context
  const pg = getKysely()

  // VALIDATION
  const [mattermostProvider] = await dataLoader
    .get('sharedIntegrationProviders')
    .load({service: 'mattermost', orgIds: [], teamIds: []})
  if (!mattermostProvider || mattermostProvider.authStrategy !== 'sharedSecret') {
    return {error: {message: 'Mattermost integration not found'}}
  }
  const {id: providerId} = mattermostProvider

  // RESOLUTION
  const teamNotificationSettings = await pg
    .deleteFrom('TeamNotificationSettings')
    .where('providerId', '=', providerId)
    .where('teamId', '=', teamId)
    .where('channelId', '=', channelId)
    .returning('id')
    .executeTakeFirst()

  if (!teamNotificationSettings) {
    return {error: {message: 'Channel not found'}}
  }

  const settings = await dataLoader
    .get('teamNotificationSettingsByProviderIdAndTeamId')
    .load({providerId, teamId})
  const linkedChannels = settings.map(({channelId}) => channelId).filter(isNotNull)

  const data = {
    teamId,
    linkedChannels,
    teamNotificationSettingsId: TeamNotificationSettingsId.join(teamNotificationSettings.id)
  }
  return data
}

export default unlinkMattermostChannel
