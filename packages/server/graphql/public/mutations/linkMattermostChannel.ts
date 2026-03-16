import {sql} from 'kysely'
import {isNotNull} from '../../../../client/utils/predicates'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import logError from '../../../utils/logError'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const linkMattermostChannel: MutationResolvers['linkMattermostChannel'] = async (
  _source,
  {teamId, channelId, channelToken},
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

  // VALIDATION
  // Fetch the team to get its orgId so we can find org-scoped providers.
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const providers = await dataLoader
    .get('sharedIntegrationProviders')
    .load({service: 'mattermost', orgIds: [team.orgId], teamIds: []})
  const sharedSecretProviders = providers.filter((p) => p.authStrategy === 'sharedSecret')
  // Prefer org-scoped provider (org-specific Mattermost instance) over global (self-hosted default).
  const mattermostProvider =
    sharedSecretProviders.find((p) => p.scope === 'org' && p.orgId === team.orgId) ??
    sharedSecretProviders.find((p) => p.scope === 'global')
  if (!mattermostProvider) {
    return {error: {message: 'Mattermost integration not found'}}
  }
  const {id: providerId} = mattermostProvider

  // RESOLUTION
  // Store the signed channel token in TeamMemberIntegrationAuth as a JSON payload so the
  // notification helper can extract channelId for URL construction and send the token as a
  // Bearer credential to the Go plugin's /notify endpoint.
  // The Go plugin verifies this token with its own ParabolToken (never shared with Parabol).
  // Format: {"channelId": "<id>", "token": "<hmac-hex>"}
  const accessToken = JSON.stringify({channelId, token: channelToken})

  await pg
    .insertInto('TeamMemberIntegrationAuth')
    .values({
      service: 'mattermost',
      providerId,
      teamId,
      userId: viewerId,
      isActive: true,
      accessToken
    })
    .onConflict((oc) =>
      oc.columns(['teamId', 'userId', 'service', 'providerId']).doUpdateSet({
        accessToken,
        isActive: true,
        updatedAt: new Date()
      })
    )
    .execute()

  const teamNotificationSettings = await pg
    .insertInto('TeamNotificationSettings')
    .columns(['providerId', 'teamId', 'events', 'channelId'])
    .values(() => ({
      providerId,
      teamId,
      events: sql`enum_range(NULL::"SlackNotificationEventEnum")`,
      channelId
    }))
    .onConflict((oc) =>
      oc.columns(['providerId', 'teamId', 'channelId']).doUpdateSet({
        events: (eb) => eb.ref('excluded.events')
      })
    )
    .returningAll()
    .executeTakeFirst()

  if (!teamNotificationSettings) {
    logError(new Error('Linking Mattermost Channel failed'), {
      tags: {teamId, channelId}
    })
    return {error: {message: 'Linking failed'}}
  }

  const settings = await dataLoader
    .get('teamNotificationSettingsByProviderIdAndTeamId')
    .load({providerId, teamId})
  const linkedChannels = settings.map(({channelId}) => channelId).filter(isNotNull)

  const data = {teamId, linkedChannels, teamNotificationSettings}
  return data
}

export default linkMattermostChannel
