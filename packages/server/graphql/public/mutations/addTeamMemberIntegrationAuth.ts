import {sql} from 'kysely'
import IntegrationProviderId from '~/shared/gqlIds/IntegrationProviderId'
import {OAuth2AuthorizeResponse} from '../../../integrations/OAuth2Manager'
import GcalOAuth2Manager from '../../../integrations/gcal/GcalOAuth2Manager'
import GitLabOAuth2Manager from '../../../integrations/gitlab/GitLabOAuth2Manager'
import JiraServerOAuth1Manager, {
  OAuth1Auth
} from '../../../integrations/jiraServer/JiraServerOAuth1Manager'
import LinearOAuth2Manager from '../../../integrations/linear/LinearOAuth2Manager' // Add Linear manager import
import getKysely from '../../../postgres/getKysely' // Add missing import
import {IntegrationProviderAzureDevOps} from '../../../postgres/queries/getIntegrationProvidersByIds'
import type {
  Integrationproviderauthstrategyenum,
  Integrationproviderserviceenum
} from '../../../postgres/types/pg.d.ts' // Use import type and correct casing
import AzureDevOpsServerManager from '../../../utils/AzureDevOpsServerManager'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import updateRepoIntegrationsCacheByPerms from '../../queries/helpers/updateRepoIntegrationsCacheByPerms'
import {MutationResolvers} from '../resolverTypes'

interface OAuth2Auth {
  accessToken: string
  refreshToken: string | null // Allow null refreshToken
  scopes: string
  expiresAt?: Date | null
}

const convertExpiresIn = (
  authResponse: (OAuth2AuthorizeResponse & {refreshToken?: string | null}) | Error
): OAuth2Auth | Error => {
  if (authResponse instanceof Error) {
    return authResponse
  }

  // Handle case where expiresIn might be missing or null/undefined
  const expiresIn = authResponse.expiresIn
  let expiresAt: Date | null | undefined = undefined

  if (typeof expiresIn === 'number') {
    const buffer = 30 // 30 seconds buffer
    const expiresAtTimestamp = new Date().getTime() + (expiresIn - buffer) * 1000
    expiresAt = new Date(expiresAtTimestamp)
  }

  // Construct the result, ensuring refreshToken is handled (defaults to null if undefined)
  return {
    accessToken: authResponse.accessToken,
    refreshToken: authResponse.refreshToken ?? null,
    scopes: authResponse.scopes,
    expiresAt: expiresAt
  }
}

const addTeamMemberIntegrationAuth: MutationResolvers['addTeamMemberIntegrationAuth'] = async (
  _source,
  {providerId, service: inputService, oauthCodeOrPat, oauthVerifier, teamId, redirectUri}, // Add service, make providerId optional in schema later
  context
) => {
  const {authToken, dataLoader} = context // Keep original declarations
  const viewerId = getUserId(authToken)
  const pg = getKysely()

  // --- Validation: Ensure exactly one of providerId or service is provided ---
  if ((providerId && inputService) || (!providerId && !inputService)) {
    return standardError(new Error('Exactly one of providerId or service must be provided.'), {
      userId: viewerId
    })
  }
  // --- End Validation ---
  //AUTH
  // AUTH: Check if user is member of the target team
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('User is not a member of the target team.'), {userId: viewerId})
  }

  let integrationProvider: any = null // Use any for now, will be typed later
  let providerDbId: number | null = null
  let service: Integrationproviderserviceenum | null = inputService || null
  let authStrategy: Integrationproviderauthstrategyenum | null = null

  if (providerId) {
    providerDbId = IntegrationProviderId.split(providerId)
    integrationProvider = await dataLoader.get('integrationProviders').load(providerDbId)
    if (!integrationProvider) {
      return standardError(
        new Error(`Unable to find integration provider for providerId ${providerId}`),
        {userId: viewerId}
      )
    }
    service = integrationProvider.service
    authStrategy = integrationProvider.authStrategy
  } else if (service === 'linear') {
    // If service is 'linear', fetch the global provider for it
    // Assuming a dataloader or query exists to find a global provider by service name
    // For now, let's assume we fetch it and get its ID. Placeholder logic:
    const globalProviders = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'linear', scope: 'global'})
    integrationProvider = globalProviders[0] || null // Assuming sharedIntegrationProviders exists and handles scope
    if (!integrationProvider) {
      return standardError(
        new Error(`Global integration provider for service '${service}' not found.`),
        {userId: viewerId}
      )
    }
    providerDbId = integrationProvider.id // Get the ID from the fetched global provider
    authStrategy = 'oauth2' // Hardcode for Linear via env vars
  } else {
    // Handle other potential services provided directly? Or error?
    return standardError(
      new Error(`Service '${service}' cannot be configured directly without a providerId yet.`),
      {userId: viewerId}
    )
  }

  // Ensure we have a providerDbId at this point
  if (!providerDbId) {
    return standardError(new Error(`Could not determine provider database ID.`), {userId: viewerId})
  }

  const viewer = await dataLoader.get('users').loadNonNull(viewerId)

  // VALIDATION
  // Use determined service/strategy/provider details
  const {scope} = integrationProvider // Scope check still relevant
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
    if (service === 'gitlab') {
      const {clientId, clientSecret, serverBaseUrl} = integrationProvider
      const manager = new GitLabOAuth2Manager(clientId, clientSecret, serverBaseUrl)
      const authRes = await manager.authorize(oauthCodeOrPat, redirectUri)
      tokenMetadata = convertExpiresIn(authRes)
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
      const authRes = await manager.authorize(oauthCodeOrPat, oauthVerifier)
      tokenMetadata = convertExpiresIn(authRes)
    }
    if (service === 'gcal') {
      const {clientId, clientSecret, serverBaseUrl} = integrationProvider
      const manager = new GcalOAuth2Manager(clientId, clientSecret, serverBaseUrl)
      const authRes = await manager.authorize(oauthCodeOrPat, redirectUri)
      tokenMetadata = convertExpiresIn(authRes)
    }
    // --- Add Linear OAuth2 Handling ---
    if (service === 'linear') {
      // Linear uses env vars, no provider details needed for manager
      const manager = new LinearOAuth2Manager()
      const authRes = await manager.exchangeCode(oauthCodeOrPat, redirectUri)
      tokenMetadata = convertExpiresIn(authRes)
    }
    // --- End Linear Handling ---
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

  // Ensure service is determined before proceeding
  if (!service) {
    return standardError(new Error('Could not determine integration service.'), {userId: viewerId})
  }
  const auth = await pg
    .insertInto('TeamMemberIntegrationAuth')
    .values({
      ...tokenMetadata,
      providerId: providerDbId,
      service,
      teamId,
      userId: viewerId
    })
    .onConflict(
      (
        oc // Add type for oc param
      ) =>
        oc.columns(['userId', 'teamId', 'service']).doUpdateSet((eb: any) => ({
          // Add type for eb param
          ...tokenMetadata,
          providerId: providerDbId,
          isActive: true
        }))
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
      .onConflict((oc: any) => oc.doNothing()) // Add type for oc param
      .execute()
  }

  updateRepoIntegrationsCacheByPerms(dataLoader, viewerId, teamId, true)

  // Ensure service is non-null before analytics call
  if (service) {
    analytics.integrationAdded(viewer, teamId, service)
  }

  const data = {userId: viewerId, teamId, service}
  return data
}

export default addTeamMemberIntegrationAuth
