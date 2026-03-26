import TeamNotificationSettingsId from '../../../../client/shared/gqlIds/TeamNotificationSettingsId'
import {isNotNull} from '../../../../client/utils/predicates'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

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
    return standardError(new Error('Attempted teamId spoof'), {
      userId: viewerId
    })
  }

  // RESOLUTION
  // Look up the channel's notification settings first to find which provider it belongs to.
  // A channel may be linked to either a global or an org-scoped Mattermost provider — we
  // discover the providerId from the existing record rather than guessing.
  const teamNotificationSettings = await pg
    .deleteFrom('TeamNotificationSettings')
    .using('IntegrationProvider')
    .whereRef('TeamNotificationSettings.providerId', '=', 'IntegrationProvider.id')
    .where('IntegrationProvider.service', '=', 'mattermost')
    .where('TeamNotificationSettings.teamId', '=', teamId)
    .where('TeamNotificationSettings.channelId', '=', channelId)
    .returning(['TeamNotificationSettings.id', 'TeamNotificationSettings.providerId'])
    .executeTakeFirst()

  if (!teamNotificationSettings) {
    return {error: {message: 'Channel not found'}}
  }
  const {providerId} = teamNotificationSettings

  // Remove the TeamMemberIntegrationAuth whose accessToken JSON references this channelId.
  // We cast to jsonb for the extraction since accessToken is stored as text.
  await pg
    .deleteFrom('TeamMemberIntegrationAuth')
    .where('service', '=', 'mattermost')
    .where('providerId', '=', providerId)
    .where('teamId', '=', teamId)
    .where('userId', '=', viewerId)
    .where(
      (eb) =>
        eb(
          eb.fn<string>('jsonb_extract_path_text', [
            eb.cast(eb.ref('accessToken'), 'jsonb'),
            eb.val('channelId')
          ]),
          '=',
          channelId
        )
    )
    .execute()

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
