import IntegrationProviderId from '~/shared/gqlIds/IntegrationProviderId'
import GcalOAuth2Manager from '../../../integrations/gcal/GcalOAuth2Manager'
import GitLabOAuth2Manager from '../../../integrations/gitlab/GitLabOAuth2Manager'
import JiraServerOAuth1Manager, {
  OAuth1Auth
} from '../../../integrations/jiraServer/JiraServerOAuth1Manager'
import {IntegrationProviderAzureDevOps} from '../../../postgres/queries/getIntegrationProvidersByIds'
import upsertTeamMemberIntegrationAuth from '../../../postgres/queries/upsertTeamMemberIntegrationAuth'
import AzureDevOpsServerManager from '../../../utils/AzureDevOpsServerManager'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import updateRepoIntegrationsCacheByPerms from '../../queries/helpers/updateRepoIntegrationsCacheByPerms'
import {MutationResolvers} from '../resolverTypes'

interface OAuth2Auth {
  accessToken: string
  refreshToken: string
  scopes: string
  expiresAt?: Date | null
}

const addTeamMemberIntegrationAuth: MutationResolvers['addTeamMemberIntegrationAuth'] = async (
  _source,
  {providerId, oauthCodeOrPat, oauthVerifier, teamId, redirectUri},
  context
) => {
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)

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
    const [providerTeam, authTeam] = await Promise.all([
      dataLoader.get('teams').loadNonNull(integrationProvider.teamId),
      dataLoader.get('teams').loadNonNull(teamId)
    ])
    if (providerTeam.orgId !== authTeam.orgId) {
      return {error: {message: 'provider not available for this team'}}
    }
  }

  let tokenMetadata: OAuth2Auth | OAuth1Auth | Error | undefined = undefined
  if (authStrategy === 'oauth2') {
    if (!oauthCodeOrPat || !redirectUri)
      return {error: {message: 'Missing OAuth2 code or redirect URI'}}
    if (service === 'gitlab') {
      const {clientId, clientSecret, serverBaseUrl} = integrationProvider
      const manager = new GitLabOAuth2Manager(clientId, clientSecret, serverBaseUrl)
      const authRes = await manager.authorize(oauthCodeOrPat, redirectUri)
      if ('expiresIn' in authRes) {
        const {expiresIn, ...metadata} = authRes
        const buffer = 30
        const expiresAtTimestamp = new Date().getTime() + (expiresIn - buffer) * 1000
        const expiresAt = new Date(expiresAtTimestamp)
        tokenMetadata = {
          expiresAt,
          ...metadata
        }
      } else {
        tokenMetadata = authRes
      }
    }
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
      tokenMetadata = (await manager.init(oauthCodeOrPat, oauthVerifier)) as OAuth2Auth | Error
    }
    if (service === 'gcal') {
      const {clientId, clientSecret, serverBaseUrl} = integrationProvider
      const manager = new GcalOAuth2Manager(clientId, clientSecret, serverBaseUrl)
      const authRes = await manager.authorize(oauthCodeOrPat, redirectUri)

      if ('expiresIn' in authRes) {
        const {expiresIn, ...metadata} = authRes
        const expiresAtTimestamp = new Date().getTime() + (expiresIn - 30) * 1000
        const expiresAt = new Date(expiresAtTimestamp)
        tokenMetadata = {
          expiresAt,
          ...metadata
        }
      } else {
        tokenMetadata = authRes
      }
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
  await upsertTeamMemberIntegrationAuth({
    ...tokenMetadata,
    providerId: providerDbId,
    service,
    teamId,
    userId: viewerId
  })
  updateRepoIntegrationsCacheByPerms(dataLoader, viewerId, teamId, true)

  analytics.integrationAdded(viewer, teamId, service)

  const data = {userId: viewerId, teamId, service}
  return data
}

export default addTeamMemberIntegrationAuth
