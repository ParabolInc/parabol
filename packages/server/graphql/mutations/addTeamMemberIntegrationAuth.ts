import {GraphQLID, GraphQLNonNull} from 'graphql'
import IntegrationProviderId from '~/shared/gqlIds/IntegrationProviderId'
import GitLabOAuth2Manager from '../../integrations/gitlab/GitLabOAuth2Manager'
import {TIntegrationProvider} from '../../postgres/queries/getIntegrationProvidersByIds'
import upsertTeamMemberIntegrationAuth from '../../postgres/queries/upsertTeamMemberIntegrationAuth'
import {getUserId, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import AddTeamMemberIntegrationAuthPayload from '../types/AddTeamMemberIntegrationAuthPayload'
import GraphQLURLType from '../types/GraphQLURLType'

const createTokenMetadata = async (
  provider: TIntegrationProvider,
  oauthCodeOrPat: string,
  redirectUri: string
) => {
  const {authStrategy, service} = provider
  if (authStrategy === 'oauth2') {
    if (service === 'gitlab') {
      const {clientId, clientSecret, serverBaseUrl} = provider
      const manager = new GitLabOAuth2Manager(clientId, clientSecret, serverBaseUrl)
      const res = await manager.authorize(oauthCodeOrPat, redirectUri)
      return res
    }
  }
  return {} as Record<string, never>
}

const addTeamMemberIntegrationAuth = {
  name: 'AddTeamMemberIntegrationAuth',
  type: new GraphQLNonNull(AddTeamMemberIntegrationAuthPayload),
  description: 'Add an integration authorization for a specific team member',
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
    const {service} = integrationProvider
    await upsertTeamMemberIntegrationAuth({
      ...tokenMetadata,
      providerId: providerDbId,
      service,
      teamId,
      userId: viewerId
    })

    const data = {userId: viewerId, teamId, service}
    return data
  }
}

export default addTeamMemberIntegrationAuth
