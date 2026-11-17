import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import IntegrationProviderId from '~/shared/gqlIds/IntegrationProviderId'
import AzureDevOpsServerManager from '../../../integrations/azureDevOps/AzureDevOpsServerManager'
import invalidateRepoIntegrationsCache from '../../../integrations/invalidateRepoIntegrationsCache'
import JiraServerOAuth1Manager, {
  type OAuth1Auth
} from '../../../integrations/jiraServer/JiraServerOAuth1Manager'
import type {OAuth2TokenResponse} from '../../../integrations/OAuth2Manager'
import createOAuth2Manager from '../../../integrations/platform/createOAuth2Manager'
import toExpiresAt from '../../../integrations/platform/toExpiresAt'
import getKysely from '../../../postgres/getKysely'
import syncTeamMemberIntegrationAuthTokens from '../../../postgres/queries/syncTeamMemberIntegrationAuthTokens'
import type {JsonObject} from '../../../postgres/types/pg'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

interface OAuth2Auth {
  accessToken: string
  refreshToken: string | undefined
  scopes: string
  expiresAt?: Date | null
}

const toOAuth2Auth = (authResponse: OAuth2TokenResponse | Error): OAuth2Auth | Error => {
  if (authResponse instanceof Error) return authResponse
  const {expiresIn, ...tokens} = authResponse
  return {...tokens, expiresAt: toExpiresAt(expiresIn)}
}

const addTeamMemberIntegrationAuth: MutationResolvers['addTeamMemberIntegrationAuth'] = async (
  _source,
  {providerId, oauthCodeOrPat, oauthVerifier, teamId},
  context
) => {
  const {authToken, dataLoader, socketId: mutatorId} = context
  const viewerId = getUserId(authToken)
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  const providerDbId = IntegrationProviderId.split(providerId)
  if (!Number.isInteger(providerDbId)) {
    throw new GraphQLError(`Invalid integration provider id: ${providerId}`, {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  const integrationProvider = await dataLoader.get('integrationProviders').load(providerDbId)
  if (!integrationProvider) {
    throw new GraphQLError(`Unable to find appropriate integration provider for ${providerId}`, {
      extensions: {code: 'NOT_FOUND'}
    })
  }

  // VALIDATION
  const {authStrategy, service: providerService, scope} = integrationProvider
  if (scope === 'team') {
    if (teamId !== integrationProvider.teamId) {
      throw new GraphQLError('teamId mismatch', {extensions: {code: 'BAD_USER_INPUT'}})
    }
  } else if (scope === 'org' && teamId !== integrationProvider.teamId) {
    const authTeam = await dataLoader.get('teams').loadNonNull(teamId)
    if (integrationProvider.orgId !== authTeam.orgId) {
      throw new GraphQLError('provider not available for this team', {
        extensions: {code: 'BAD_USER_INPUT'}
      })
    }
  }

  let tokenMetadata: OAuth2Auth | OAuth1Auth | Error | undefined
  let providerUserId: string | null = null
  let meta: JsonObject | null = null
  if (authStrategy === 'oauth2') {
    if (!oauthCodeOrPat)
      throw new GraphQLError('Missing OAuth2 code', {extensions: {code: 'BAD_USER_INPUT'}})
    if (integrationProvider.service === 'azureDevOps') {
      if (!oauthVerifier) {
        throw new GraphQLError('Missing OAuth2 Verifier required for Azure DevOps authentication', {
          extensions: {code: 'BAD_USER_INPUT'}
        })
      }
      const manager = new AzureDevOpsServerManager(null, integrationProvider)
      const authRes = await manager.authorize(oauthCodeOrPat, oauthVerifier)
      if (authRes instanceof Error)
        throw new GraphQLError(authRes.message, {extensions: {code: 'BAD_USER_INPUT'}})
      const {providerUserId: authProviderUserId, meta: authMeta, ...tokens} = authRes
      tokenMetadata = toOAuth2Auth(tokens)
      providerUserId = authProviderUserId
      meta = authMeta ?? null
    }
    const manager = createOAuth2Manager(integrationProvider)
    if (manager) {
      const authRes = await manager.authorize(oauthCodeOrPat)
      if (authRes instanceof Error)
        throw new GraphQLError(authRes.message, {extensions: {code: 'BAD_USER_INPUT'}})
      const {providerUserId: authProviderUserId, meta: authMeta, ...tokens} = authRes
      tokenMetadata = toOAuth2Auth(tokens)
      providerUserId = authProviderUserId
      meta = authMeta ?? null
    }
  }
  if (authStrategy === 'oauth1') {
    if (!oauthCodeOrPat || !oauthVerifier)
      throw new GraphQLError('Missing OAuth1 token or verifier', {
        extensions: {code: 'BAD_USER_INPUT'}
      })
    if (providerService === 'jiraServer') {
      const {serverBaseUrl, consumerKey, consumerSecret} = integrationProvider
      const manager = new JiraServerOAuth1Manager(serverBaseUrl, consumerKey, consumerSecret)
      tokenMetadata = await manager.accessToken(oauthCodeOrPat, oauthVerifier)
    }
  }

  if (tokenMetadata instanceof Error) {
    throw new GraphQLError(tokenMetadata.message, {extensions: {code: 'BAD_USER_INPUT'}})
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
        expiredAt: null,
        ...(providerUserId !== null && {providerUserId}),
        ...(meta !== null && {meta})
      })
    )
    .returning('id')
    .executeTakeFirst()
  const authId = auth?.id
  if (!authId) {
    throw new GraphQLError('Failed to insert TeamMemberIntegrationAuth', {
      extensions: {code: 'INTERNAL_SERVER_ERROR'}
    })
  }

  if (providerUserId !== null && tokenMetadata && 'refreshToken' in tokenMetadata) {
    const {accessToken, refreshToken, scopes, expiresAt} = tokenMetadata
    await syncTeamMemberIntegrationAuthTokens({
      userId: viewerId,
      teamId,
      providerId: providerDbId,
      providerUserId,
      accessToken,
      refreshToken: refreshToken ?? null,
      scopes,
      expiresAt: expiresAt ?? null
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

  await invalidateRepoIntegrationsCache(teamId, viewerId, providerService, 'added')

  const data = {userId: viewerId, teamId, service: providerService}
  publish(
    SubscriptionChannel.NOTIFICATION,
    viewerId,
    'AddTeamMemberIntegrationAuthSuccess',
    data,
    subOptions
  )
  return data
}

export default addTeamMemberIntegrationAuth
