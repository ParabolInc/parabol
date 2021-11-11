import {GraphQLID, GraphQLNonNull} from 'graphql'
import upsertGitHubAuth from '../../postgres/queries/upsertGitHubAuth'
import {GetProfileQuery} from '../../types/githubTypes'
import {getUserId, isTeamMember} from '../../utils/authorization'
import getProfile from '../../utils/githubQueries/getProfile.graphql'
import GitHubServerManager from '../../utils/GitHubServerManager'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLContext, GQLResolveInfo} from '../graphql'
import {GitHubRequest} from '../rootSchema'
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
    info: GQLResolveInfo
  ) => {
    const {authToken} = context
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
    }

    // RESOLUTION
    const {accessToken, scope} = await GitHubServerManager.init(code)
    const endpointContext = {accessToken}
    const githubRequest = info.schema.githubRequest as GitHubRequest
    const {data, errors} = await githubRequest<GetProfileQuery>({
      query: getProfile,
      info,
      endpointContext,
      batchRef: context
    })

    if (errors && errors[0]) {
      return standardError(new Error(errors[0].message), {userId: viewerId})
    }
    const {viewer} = data
    const {login} = viewer

    await upsertGitHubAuth({accessToken, login, teamId, userId: viewerId, scope})
    segmentIo.track({
      userId: viewerId,
      event: 'Added Integration',
      properties: {
        teamId,
        service: 'GitHub'
      }
    })
    return {teamId, userId: viewerId}
  }
}
