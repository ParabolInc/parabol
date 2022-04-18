import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import {getUserId, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import CreateAzureDevOpsAuthorizeUrlPayload from '../types/CreateAzureDevOpsAuthorizeUrlPayload'

const createAzureDevOpsAuthorizeUrl = {
  type: GraphQLNonNull(CreateAzureDevOpsAuthorizeUrlPayload),
  description: ``,
  args: {
    providerId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Id of the integration provider with OAuth1 auth strategy'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Id of the team where the integration should be added'
    },
    providerState: {
      type: new GraphQLNonNull(GraphQLString)
    },
    redirect: {
      type: new GraphQLNonNull(GraphQLString)
    },
    code: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  resolve: async (
    _source: unknown,
    {
      providerId,
      teamId,
      providerState,
      redirect,
      code
    }: {providerId: string; teamId: string; providerState: string; redirect: string; code: string},
    {authToken, dataLoader}: GQLContext
  ) => {
    //AUTH
    const viewerId = getUserId(authToken)
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId, tags: {teamId}})
    }

    // RESOLUTION
    const provider = await dataLoader
      .get('integrationProviders')
      .load(IntegrationProviderId.split(providerId))
    if (!provider || provider.authStrategy !== 'oauth2') {
      return standardError(new Error('Integration provider not found'), {
        userId: viewerId,
        tags: {providerId}
      })
    }

    if (provider.service === 'azureDevOps') {
      const scope = '499b84ac-1321-427f-aa17-267ca6975798/.default'
      const url = `https://login.microsoftonline.com/${provider.tenantId}/oauth2/v2.0/authorize?client_id=${provider.clientId}&response_type=code&redirect_uri=${redirect}&response_mode=query&scope=${scope}&state=${providerState}&code_challenge=${code}&code_challenge_method=S256`

      return {
        url
      }
    }
    return standardError(new Error('Service not supported'), {
      tags: {service: (provider as any).service}
    })
  }
}

export default createAzureDevOpsAuthorizeUrl
