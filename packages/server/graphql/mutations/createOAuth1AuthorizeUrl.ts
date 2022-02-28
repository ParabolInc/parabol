import {GraphQLID, GraphQLNonNull} from 'graphql'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import JiraServerOAuth1Manager from '../../integrations/jiraServer/JiraServerOAuth1Manager'
import {getUserId, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import CreateOAuth1AuthorizationURLPayload from '../types/CreateOAuth1AuthorizationURLPayload'

export default {
  type: CreateOAuth1AuthorizationURLPayload,
  description:
    'Generate a new OAuth1 request token and encode it in the authorization URL to start an oauth1 flow',
  args: {
    providerId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Id of the integration provider with OAuth1 auth strategy'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Id of the team where the integration should be added'
    }
  },
  async resolve(
    _source: unknown,
    {providerId, teamId}: {providerId: string; teamId: string},
    {authToken, dataLoader}: GQLContext
  ) {
    const viewerId = getUserId(authToken)
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId, tags: {teamId}})
    }

    const provider = await dataLoader
      .get('integrationProviders')
      .load(IntegrationProviderId.split(providerId))
    if (!provider || provider.authStrategy !== 'oauth1') {
      return standardError(new Error('Integration provider not found'), {
        userId: viewerId,
        tags: {providerId}
      })
    }

    if (provider.service === 'jiraServer') {
      const manager = new JiraServerOAuth1Manager(
        provider.serverBaseUrl,
        provider.consumerKey,
        provider.consumerSecret
      )
      const url = await manager.requestToken()

      if (url instanceof Error) {
        return standardError(url)
      }
      return {
        url
      }
    }
    return standardError(new Error('Service not supported'), {
      tags: {service: (provider as any).service}
    })
  }
}
