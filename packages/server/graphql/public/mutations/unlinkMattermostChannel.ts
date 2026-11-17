import {GraphQLError} from 'graphql'
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
    throw new GraphQLError('Mattermost integration not found', {extensions: {code: 'NOT_FOUND'}})
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
    throw new GraphQLError('Channel not found', {extensions: {code: 'NOT_FOUND'}})
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
