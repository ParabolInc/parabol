import TeamNotificationSettingsId from '../../../../client/shared/gqlIds/TeamNotificationSettingsId'
import {isNotNull} from '../../../../client/utils/predicates'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const unlinkMattermostChannel: MutationResolvers['unlinkMattermostChannel'] = async (
  _source,
  {teamId, channelId},
  context
) => {
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)
  const pg = getKysely()

  //AUTH
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
  }

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
