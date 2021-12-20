import {GraphQLID, GraphQLNonNull, GraphQLResolveInfo} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {GQLContext} from '../graphql'
import {getUserId, isTeamMember} from '../../utils/authorization'
import AddIntegrationTokenPayload from '../types/AddIntegrationTokenPayload'
import standardError from '../../utils/standardError'
import publish from '../../utils/publish'
import GraphQLURLType from '../types/GraphQLURLType'
import upsertIntegrationToken from '../../postgres/queries/upsertIntegrationToken'
import {
  createAuthorizationManager,
  createIntegrationServerManager
} from '../../integrations/MakeIntegrationServerManager'
import IntegrationProviderId from '~/shared/gqlIds/IntegrationProviderId'
import {
  OAuth2AuthorizationManager,
  OAuth2IntegrationServerManager
} from '../../integrations/IntegrationServerManager'
import {
  IntegrationProvider,
  isOAuth2ProviderMetadata
} from '../../postgres/types/IntegrationProvider'

const createTokenMetadata = async (
  provider: IntegrationProvider,
  oauthCodeOrPat: string,
  redirectUri: string,
  info: GraphQLResolveInfo,
  context: GQLContext
) => {
  const {providerMetadata} = provider
  if (isOAuth2ProviderMetadata(providerMetadata)) {
    const authorizationManager = await createAuthorizationManager<OAuth2AuthorizationManager>(
      provider
    )

    const authResponse = await authorizationManager.authorize(oauthCodeOrPat, redirectUri)
    if (authResponse instanceof Error) return authResponse
    const {accessToken, refreshToken, scopes} = authResponse

    const integrationServerManager =
      await createIntegrationServerManager<OAuth2IntegrationServerManager>(provider, accessToken)
    const [tokenTestValid, tokenTestError] = await integrationServerManager.isTokenValid(
      info,
      context
    )
    if (!tokenTestValid) {
      return tokenTestError
        ? tokenTestError
        : new Error(`Unknown error occurred when validating token`)
    }
    return {accessToken, refreshToken, scopes}
  }

  return null
}

const addIntegrationToken = {
  name: 'AddIntegrationToken',
  type: new GraphQLNonNull(AddIntegrationTokenPayload),
  description: 'Add integration token material to the team, supported by the GitLab integration',
  args: {
    providerId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    oauthCodeOrPat: {
      type: new GraphQLNonNull(GraphQLID)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    redirectUri: {
      type: new GraphQLNonNull(GraphQLURLType)
    }
  },
  resolve: async (
    _source,
    {providerId, oauthCodeOrPat, teamId, redirectUri},
    context: GQLContext,
    info: GraphQLResolveInfo
  ) => {
    const {authToken, dataLoader, socketId: mutatorId} = context
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
    }

    const providerDbId = IntegrationProviderId.split(providerId)
    const provider = await dataLoader.get('integrationProviders').load(providerDbId)
    if (!provider) {
      return standardError(
        new Error(`Unable to find appropriate integration provider for providerId ${providerId}`),
        {
          userId: viewerId
        }
      )
    }

    // VALIDATION
    const tokenMetadata = await createTokenMetadata(
      provider,
      oauthCodeOrPat,
      redirectUri,
      info,
      context
    )
    if (tokenMetadata instanceof Error) {
      return standardError(tokenMetadata, {
        userId: viewerId
      })
    }

    // TODO: support pat, webhooks, etc. Not just oauth2

    // RESOLUTION
    await upsertIntegrationToken({
      providerId: providerDbId,
      teamId,
      userId: viewerId,
      tokenMetadata: {...tokenMetadata}
    })

    const data = {userId: viewerId, teamId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddIntegrationToken', data, subOptions)
    return data
  }
}

export default addIntegrationToken
