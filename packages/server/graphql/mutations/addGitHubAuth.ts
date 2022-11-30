import {GraphQLID, GraphQLNonNull, GraphQLResolveInfo} from 'graphql'
import upsertGitHubAuth from '../../postgres/queries/upsertGitHubAuth'
import {GetProfileQuery} from '../../types/githubTypes'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import getGitHubRequest from '../../utils/getGitHubRequest'
import getProfile from '../../utils/githubQueries/getProfile.graphql'
import GitHubServerManager from '../../utils/GitHubServerManager'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import updateRepoIntegrationsCacheByPerms from '../queries/helpers/updateRepoIntegrationsCacheByPerms'
import AddGitHubAuthPayload from '../types/AddGitHubAuthPayload'

export default {
  name: 'AddGitHubAuth',
  type: new GraphQLNonNull(AddGitHubAuthPayload),
  args: {
    code: {
      type: new GraphQLNonNull(GraphQLID)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source: unknown,
    {code, teamId}: {code: string; teamId: string},
    context: GQLContext,
    info: GraphQLResolveInfo
  ) => {
    const {authToken, dataLoader} = context
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
    }

    // RESOLUTION
    const oAuth2Response = await GitHubServerManager.init(code)
    if (oAuth2Response instanceof Error) {
      return standardError(oAuth2Response, {userId: viewerId})
    }
    const {accessToken, scopes} = oAuth2Response
    const githubRequest = getGitHubRequest(info, context, {
      accessToken
    })
    const [data, error] = await githubRequest<GetProfileQuery>(getProfile)

    if (error) {
      return standardError(error, {userId: viewerId})
    }
    const {viewer} = data
    const {login} = viewer

    await upsertGitHubAuth({accessToken, login, teamId, userId: viewerId, scope: scopes})
    updateRepoIntegrationsCacheByPerms(dataLoader, viewerId, teamId, true)
    analytics.integrationAdded(viewerId, teamId, 'github')

    return {teamId, userId: viewerId}
  }
}
