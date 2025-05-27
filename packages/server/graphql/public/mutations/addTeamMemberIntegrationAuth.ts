import {sql} from 'kysely'
import IntegrationProviderId from '~/shared/gqlIds/IntegrationProviderId'
import {OAuth2AuthorizeResponse} from '../../../integrations/OAuth2Manager'
import GcalOAuth2Manager from '../../../integrations/gcal/GcalOAuth2Manager'
import GitLabOAuth2Manager from '../../../integrations/gitlab/GitLabOAuth2Manager'
import JiraServerOAuth1Manager, {
  OAuth1Auth
} from '../../../integrations/jiraServer/JiraServerOAuth1Manager'
import LinearManager from '../../../integrations/linear/LinearManager'
import getKysely from '../../../postgres/getKysely'
import {IntegrationProviderAzureDevOps} from '../../../postgres/queries/getIntegrationProvidersByIds'
import AzureDevOpsServerManager from '../../../utils/AzureDevOpsServerManager'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import updateRepoIntegrationsCacheByPerms from '../../queries/helpers/updateRepoIntegrationsCacheByPerms'
import {MutationResolvers} from '../resolverTypes'

interface OAuth2Auth {
  accessToken: string
  refreshToken: string | undefined
  scopes: string
  expiresAt?: Date | null
}

const convertExpiresIn = (authResponse: OAuth2AuthorizeResponse | Error): OAuth2Auth | Error => {
  if ('expiresIn' in authResponse && authResponse.expiresIn) {
    const {expiresIn, ...metadata} = authResponse
    const buffer = 30
    const expiresAtTimestamp = new Date().getTime() + (expiresIn - buffer) * 1000
    const expiresAt = new Date(expiresAtTimestamp)
    return {
      expiresAt,
      ...metadata
    }
  }
  return authResponse
}

const addTeamMemberIntegrationAuth: MutationResolvers['addTeamMemberIntegrationAuth'] = async (
  _source,
  {providerId, oauthCodeOrPat, oauthVerifier, teamId, redirectUri},
  context
) => {
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)
  const pg = getKysely()

  //AUTH
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
  }

  const providerDbId = IntegrationProviderId.split(providerId)
  const [integrationProvider, viewer] = await Promise.all([
    dataLoader.get('integrationProviders').load(providerDbId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  if (!integrationProvider) {
    return standardError(
      new Error(`Unable to find appropriate integration provider for providerId ${providerId}`),
      {
        userId: viewerId
      }
    )
  }

  // VALIDATION
  const {authStrategy, service, scope} = integrationProvider
  if (scope === 'team') {
    if (teamId !== integrationProvider.teamId) {
      return {error: {message: 'teamId mismatch'}}
    }
  } else if (scope === 'org' && teamId !== integrationProvider.teamId) {
    const authTeam = await dataLoader.get('teams').loadNonNull(teamId)
    if (integrationProvider.orgId !== authTeam.orgId) {
      return {error: {message: 'provider not available for this team'}}
    }
  }

  let tokenMetadata: OAuth2Auth | OAuth1Auth | Error | undefined = undefined
  if (authStrategy === 'oauth2') {
    if (!oauthCodeOrPat || !redirectUri)
      return {error: {message: 'Missing OAuth2 code or redirect URI'}}
    if (service === 'azureDevOps') {
      if (!oauthVerifier) {
        return {
          error: {message: 'Missing OAuth2 Verifier required for Azure DevOps authentication'}
        }
      }
      const manager = new AzureDevOpsServerManager(
        null,
        integrationProvider as IntegrationProviderAzureDevOps
      )
      const authRes = await manager.authorize(oauthCodeOrPat, oauthVerifier)
      tokenMetadata = convertExpiresIn(authRes)
    }
    let manager: GcalOAuth2Manager | LinearManager | GitLabOAuth2Manager | null = null
    const {clientId, clientSecret, serverBaseUrl} = integrationProvider

    switch (service) {
      case 'gcal':
        manager = new GcalOAuth2Manager(clientId, clientSecret, serverBaseUrl)
        break
      case 'linear':
        manager = new LinearManager(clientId, clientSecret, serverBaseUrl)
        break
      case 'gitlab':
        manager = new GitLabOAuth2Manager(clientId, clientSecret, serverBaseUrl)
        break
    }

    if (manager) {
      const authRes = await manager.authorize(oauthCodeOrPat, redirectUri)
      tokenMetadata = convertExpiresIn(authRes)
    }
  }
  if (authStrategy === 'oauth1') {
    if (!oauthCodeOrPat || !oauthVerifier)
      return {error: {message: 'Missing OAuth1 token or verifier'}}
    if (service === 'jiraServer') {
      const {serverBaseUrl, consumerKey, consumerSecret} = integrationProvider
      const manager = new JiraServerOAuth1Manager(serverBaseUrl, consumerKey, consumerSecret)
      tokenMetadata = await manager.accessToken(oauthCodeOrPat, oauthVerifier)
    }
  }

  if (tokenMetadata instanceof Error) {
    return standardError(tokenMetadata, {
      userId: viewerId
    })
  }

  // RESOLUTION
  const auth = await pg
    .insertInto('TeamMemberIntegrationAuth')
    .values({
      ...tokenMetadata,
      providerId: providerDbId,
      service,
      teamId,
      userId: viewerId
    })
    .onConflict((oc) =>
      oc.columns(['userId', 'teamId', 'service']).doUpdateSet({
        ...tokenMetadata,
        providerId: providerDbId,
        isActive: true
      })
    )
    .returning('id')
    .executeTakeFirst()
  const authId = auth?.id
  if (!authId) {
    return standardError(new Error('Failed to insert TeamMemberIntegrationAuth'), {
      userId: viewerId
    })
  }

  if (service === 'msTeams' || service === 'mattermost') {
    await pg
      .insertInto('TeamNotificationSettings')
      .columns(['providerId', 'teamId', 'events'])
      .values(() => ({
        providerId: providerDbId,
        teamId,
        events: sql`enum_range(NULL::"SlackNotificationEventEnum")`
      }))
      .onConflict((oc) => oc.doNothing())
      .execute()
  }

  updateRepoIntegrationsCacheByPerms(dataLoader, viewerId, teamId, true)

  analytics.integrationAdded(viewer, teamId, service)

  const data = {userId: viewerId, teamId, service}
  return data
}

export default addTeamMemberIntegrationAuth
