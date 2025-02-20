import {sql} from 'kysely'
import IntegrationProviderId from '~/shared/gqlIds/IntegrationProviderId'
import {OAuth2AuthorizeResponse} from '../../../integrations/OAuth2Manager'
import GcalOAuth2Manager from '../../../integrations/gcal/GcalOAuth2Manager'
import GitLabOAuth2Manager from '../../../integrations/gitlab/GitLabOAuth2Manager'
import JiraServerOAuth1Manager, {
  OAuth1Auth
} from '../../../integrations/jiraServer/JiraServerOAuth1Manager'
import getKysely from '../../../postgres/getKysely'
import {IntegrationProviderAzureDevOps} from '../../../postgres/queries/getIntegrationProvidersByIds'
import AzureDevOpsServerManager from '../../../utils/AzureDevOpsServerManager'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import updateRepoIntegrationsCacheByPerms from '../../queries/helpers/updateRepoIntegrationsCacheByPerms'
import {MutationResolvers} from '../resolverTypes'
import {link} from 'fs'

interface OAuth2Auth {
  accessToken: string
  refreshToken: string
  scopes: string
  expiresAt?: Date | null
}

const linkNotificationChannel: MutationResolvers['linkNotificationChannel'] = async (
  _source,
  {providerId, teamId, channelId},
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
  const providerDbId = IntegrationProviderId.split(providerId)
  const integrationProvider = await dataLoader.get('integrationProviders').load(providerDbId)

  if (!integrationProvider) {
    return standardError(
      new Error(`Unable to find appropriate integration provider for providerId ${providerId}`),
      {
        userId: viewerId
      }
    )
  }

  const {service} = integrationProvider
  if (service !== 'msTeams' && service !== 'mattermost') {
    return standardError(
      new Error(`Unsupported notification service`), {userId: viewerId, tags: {service}}
    )
  }

  // RESOLUTION
  await pg
    .insertInto('TeamNotificationSettings')
    .columns(['providerId', 'teamId', 'events', 'channelId'])
    .values(() => ({
      providerId: providerDbId,
      teamId,
      events: sql`enum_range(NULL::"SlackNotificationEventEnum")`,
      channelId
    }))
    .onConflict((oc) => oc.doNothing())
    .execute()

  const data = {userId: viewerId, teamId, service}
  return data
}

export default linkNotificationChannel
