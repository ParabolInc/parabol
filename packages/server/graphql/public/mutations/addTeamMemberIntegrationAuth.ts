import {sql} from 'kysely'
import GcalOAuth2Manager from '../../../integrations/gcal/GcalOAuth2Manager'
import GDriveOAuth2Manager from '../../../integrations/gdrive/GDriveOAuth2Manager'
import GitHubOAuth2Manager from '../../../integrations/github/GitHubOAuth2Manager'
import GitLabOAuth2Manager from '../../../integrations/gitlab/GitLabOAuth2Manager'
import JiraOAuth2Manager from '../../../integrations/jira/JiraOAuth2Manager'
import syncJiraSiblingAuths from '../../../integrations/jira/syncJiraSiblingAuths'
import JiraServerOAuth1Manager, {
  type OAuth1Auth
} from '../../../integrations/jiraServer/JiraServerOAuth1Manager'
import LinearManager from '../../../integrations/linear/LinearManager'
import type OAuth2Manager from '../../../integrations/OAuth2Manager'
import type {OAuth2AuthorizeResponse} from '../../../integrations/OAuth2Manager'
import resolveIntegrationProviderForTeam from '../../../integrations/platform/resolveIntegrationProviderForTeam'
import ZoomOAuth2Manager from '../../../integrations/zoom/ZoomOAuth2Manager'
import getKysely from '../../../postgres/getKysely'
import type {IntegrationProviderAzureDevOps} from '../../../postgres/types/IntegrationProvider'
import type {JsonObject} from '../../../postgres/types/pg'
import AzureDevOpsServerManager from '../../../utils/AzureDevOpsServerManager'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import updateRepoIntegrationsCacheByPerms from '../../queries/helpers/updateRepoIntegrationsCacheByPerms'
import type {MutationResolvers} from '../resolverTypes'

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
  {providerId, service, oauthCodeOrPat, oauthVerifier, teamId, redirectUri},
  context
) => {
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)
  const pg = getKysely()

  if (!providerId && !service) {
    return {error: {message: 'Provide either providerId or service'}}
  }
  const [integrationProvider, viewer] = await Promise.all([
    resolveIntegrationProviderForTeam(dataLoader, {providerId, service, teamId}),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  if (!integrationProvider) {
    return standardError(
      new Error(`Unable to find appropriate integration provider for ${providerId ?? service}`),
      {userId: viewerId}
    )
  }
  const providerDbId = integrationProvider.id

  // VALIDATION
  const {authStrategy, service: providerService, scope} = integrationProvider
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

  let tokenMetadata: OAuth2Auth | OAuth1Auth | Error | undefined
  let providerUserId: string | null = null
  let meta: JsonObject | null = null
  if (authStrategy === 'oauth2') {
    if (!oauthCodeOrPat || !redirectUri)
      return {error: {message: 'Missing OAuth2 code or redirect URI'}}
    if (providerService === 'azureDevOps') {
      if (!oauthVerifier) {
        return {
          error: {
            message: 'Missing OAuth2 Verifier required for Azure DevOps authentication'
          }
        }
      }
      const manager = new AzureDevOpsServerManager(
        null,
        integrationProvider as IntegrationProviderAzureDevOps
      )
      const authRes = await manager.authorize(oauthCodeOrPat, oauthVerifier)
      tokenMetadata = convertExpiresIn(authRes)
    }
    let manager: OAuth2Manager | null = null
    const {clientId, clientSecret, serverBaseUrl} = integrationProvider

    switch (providerService) {
      case 'gcal':
        manager = new GcalOAuth2Manager(clientId, clientSecret, serverBaseUrl)
        break
      case 'gdrive':
        manager = new GDriveOAuth2Manager(clientId, clientSecret, serverBaseUrl)
        break
      case 'linear':
        manager = new LinearManager(clientId, clientSecret, serverBaseUrl)
        break
      case 'gitlab':
        manager = new GitLabOAuth2Manager(clientId, clientSecret, serverBaseUrl)
        break
      case 'zoom':
        manager = new ZoomOAuth2Manager(clientId, clientSecret, serverBaseUrl)
        break
      case 'jira':
        manager = new JiraOAuth2Manager(clientId, clientSecret, serverBaseUrl)
        break
      case 'github':
        manager = new GitHubOAuth2Manager(clientId, clientSecret, serverBaseUrl)
        break
    }

    if (manager) {
      const authRes = await manager.authorize(oauthCodeOrPat, redirectUri)
      if (authRes instanceof Error) return standardError(authRes, {userId: viewerId})
      const patch = await manager.afterAuthorize(authRes)
      if (patch instanceof Error) return standardError(patch, {userId: viewerId})
      tokenMetadata = convertExpiresIn({...authRes, scopes: patch.scopes ?? authRes.scopes})
      providerUserId = patch.providerUserId ?? null
      meta = patch.meta ?? null
    }
  }
  if (authStrategy === 'oauth1') {
    if (!oauthCodeOrPat || !oauthVerifier)
      return {error: {message: 'Missing OAuth1 token or verifier'}}
    if (providerService === 'jiraServer') {
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
      service: providerService,
      teamId,
      userId: viewerId,
      ...(providerUserId !== null && {providerUserId}),
      ...(meta !== null && {meta})
    })
    .onConflict((oc) =>
      oc.columns(['userId', 'teamId', 'service']).doUpdateSet({
        ...tokenMetadata,
        providerId: providerDbId,
        isActive: true,
        ...(providerUserId !== null && {providerUserId}),
        ...(meta !== null && {meta})
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

  if (
    providerService === 'jira' &&
    providerUserId &&
    tokenMetadata &&
    'refreshToken' in tokenMetadata
  ) {
    const {accessToken, refreshToken, scopes, expiresAt} = tokenMetadata
    await syncJiraSiblingAuths(pg, {
      userId: viewerId,
      providerUserId,
      accessToken,
      refreshToken: refreshToken ?? null,
      scopes,
      expiresAt: expiresAt ?? null,
      excludeTeamId: teamId
    })
  }

  if (providerService === 'msTeams' || providerService === 'mattermost') {
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

  analytics.integrationAdded(viewer, teamId, providerService)

  const data = {userId: viewerId, teamId, service: providerService}
  return data
}

export default addTeamMemberIntegrationAuth
