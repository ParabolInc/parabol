import {GraphQLID, GraphQLNonNull} from 'graphql'
import IntegrationProviderId from '~/shared/gqlIds/IntegrationProviderId'
import GitLabOAuth2Manager from '../../integrations/gitlab/GitLabOAuth2Manager'
import JiraServerOAuth1Manager, {
  OAuth1Auth
} from '../../integrations/jiraServer/JiraServerOAuth1Manager'
import {IntegrationProviderAzureDevOps} from '../../postgres/queries/getIntegrationProvidersByIds'
import upsertTeamMemberIntegrationAuth from '../../postgres/queries/upsertTeamMemberIntegrationAuth'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import AzureDevOpsServerManager from '../../utils/AzureDevOpsServerManager'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import AddTeamMemberIntegrationAuthPayload from '../types/AddTeamMemberIntegrationAuthPayload'
import GraphQLURLType from '../types/GraphQLURLType'

interface OAuth2Auth {
  accessToken: string
  refreshToken: string
  scopes: string
}

const addTeamMemberIntegrationAuth = {
  name: 'AddTeamMemberIntegrationAuth',
  type: new GraphQLNonNull(AddTeamMemberIntegrationAuthPayload),
  description: 'Add an integration authorization for a specific team member',
  args: {
    providerId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    oauthCodeOrPat: {
      type: GraphQLID,
      description: 'The OAuth2 code or personal access token. Null for webhook auth'
    },
    oauthVerifier: {
      type: GraphQLID,
      description: 'OAuth1 token verifier'
    },
    redirectUri: {
      type: GraphQLURLType,
      description: 'The URL the OAuth2 token will be sent to. Null for webhook auth'
    }
  },
  resolve: async (
    _source: unknown,
    {
      providerId,
      oauthCodeOrPat,
      oauthVerifier,
      teamId,
      redirectUri
    }: {
      providerId: string
      oauthCodeOrPat: string | null
      oauthVerifier: string | null
      teamId: string
      redirectUri: string | null
    },
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
        tokenMetadata = await manager.authorize(oauthCodeOrPat, redirectUri)
      }
      if (service === 'azureDevOps') {
        // tokenMetadata = (await AzureDevOpsServerManager.init(oauthCodeOrPat, oauthVerifier)) as
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

    analytics.integrationAdded(viewerId, teamId, service)

    const data = {userId: viewerId, teamId, service}
    return data
  }
}

export default addTeamMemberIntegrationAuth
