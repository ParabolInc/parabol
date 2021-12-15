import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {GQLContext} from '../graphql'
import {getUserId, isTeamMember} from '../../utils/authorization'
import AddIntegrationTokenPayload from '../types/AddIntegrationTokenPayload'
import standardError from '../../utils/standardError'
import publish from '../../utils/publish'
import GraphQLURLType from '../types/GraphQLURLType'
import upsertIntegrationToken from '../../postgres/queries/upsertIntegrationToken'
import MakeIntegrationServerManager from '../../integrations/MakeIntegrationServerManager'

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
    info
  ) => {
    const {authToken, dataLoader, socketId: mutatorId} = context
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
    }

    // VALIDATION
    const ServerManager = await MakeIntegrationServerManager.fromProviderId(providerId, dataLoader)
    if (!ServerManager) {
      return standardError(
        new Error(`unable to find appropriate integration handler for providerId ${providerId}`),
        {
          userId: viewerId
        }
      )
    }
    // TODO: support pat, webhooks, etc. Not just oauth2
    const maybeSetupOauth2Response = await ServerManager.setupOauth2Provider({
      code: oauthCodeOrPat,
      redirectUri
    })
    if (maybeSetupOauth2Response instanceof Error)
      return standardError(maybeSetupOauth2Response, {userId: viewerId})
    const {accessToken, oauthRefreshToken, oauthScopes} = maybeSetupOauth2Response

    const [tokenTestValid, tokenTestError] = await ServerManager.isTokenValid(info, context)

    if (!tokenTestValid) {
      return standardError(
        tokenTestError ? tokenTestError : new Error(`unknown error occurred validating token`),
        {userId: viewerId}
      )
    }

    // RESOLUTION
    await upsertIntegrationToken({
      accessToken,
      oauthRefreshToken,
      oauthScopes,
      providerId: ServerManager.provider.id,
      teamId,
      userId: viewerId
    })

    const data = {userId: viewerId, teamId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddIntegrationToken', data, subOptions)
    return data
  }
}

export default addIntegrationToken
