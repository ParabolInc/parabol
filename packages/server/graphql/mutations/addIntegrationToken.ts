import {GraphQLID, GraphQLNonNull} from 'graphql'
import IntegrationProviderId from '~/shared/gqlIds/IntegrationProviderId'
import GitLabOAuth2Manager from '../../integrations/gitlab/GitLabOAuth2Manager'
import {TIntegrationProvider} from '../../postgres/queries/getIntegrationProvidersByIds'
import upsertIntegrationToken from '../../postgres/queries/upsertIntegrationToken'
import {getUserId, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import AddIntegrationTokenPayload from '../types/AddIntegrationTokenPayload'
import GraphQLURLType from '../types/GraphQLURLType'

const createTokenMetadata = async (
  provider: TIntegrationProvider,
  oauthCodeOrPat: string,
  redirectUri: string
) => {
  const {type, service} = provider
  if (type === 'oauth2') {
    if (service === 'gitlab') {
      const manager = new GitLabOAuth2Manager(provider.providerMetadata)
      const res = await manager.authorize(oauthCodeOrPat, redirectUri)
      return res
    }
  }
  return {} as Record<string, never>
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
    {
      providerId,
      oauthCodeOrPat,
      teamId,
      redirectUri
    }: {providerId: string; oauthCodeOrPat: string; teamId: string; redirectUri: string},
    context: GQLContext
  ) => {
    const {authToken, dataLoader} = context
    const viewerId = getUserId(authToken)

    //AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
    }

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

    // VALIDATION
    const tokenMetadata = await createTokenMetadata(
      integrationProvider,
      oauthCodeOrPat,
      redirectUri
    )
    if (tokenMetadata instanceof Error) {
      return standardError(tokenMetadata, {
        userId: viewerId
      })
    }

    // RESOLUTION
    await upsertIntegrationToken({
      providerId: providerDbId,
      service: integrationProvider.service,
      teamId,
      userId: viewerId,
      tokenMetadata
    })

    const data = {userId: viewerId, teamId}
    return data
  }
}

export default addIntegrationToken
