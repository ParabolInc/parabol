import {GraphQLID, GraphQLNonNull} from 'graphql'
import removeGitHubAuthDB from '../../postgres/queries/removeGitHubAuth'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import RemoveAzureDevOpsAuthPayload from '../types/RemoveAzureDevOpsAuthPayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {GQLContext} from '../graphql'
import standardError from '../../utils/standardError'

const removeAzureDevOpsAuth = {
  name: 'removeAzureDevOpsAuth',
  type: new GraphQLNonNull(RemoveAzureDevOpsAuthPayload),
  description: 'Disconnect a team member from Azure DevOps',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the teamId to disconnect from the token'
    }
  },
  resolve: async (
    _source: unknown,
    {teamId}: {teamId: string},
    {authToken, socketId: mutatorId, dataLoader}: GQLContext
  ) => {
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    await removeGitHubAuthDB(viewerId, teamId)

    const data = {teamId, userId: viewerId}
    publish(SubscriptionChannel.TEAM, teamId, 'removeAzureDevOpsAuthPayload', data, subOptions)
    return data
  }
}

export default removeAzureDevOpsAuth
