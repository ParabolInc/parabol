import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import RemoveGitHubRepoPayload from 'server/graphql/types/RemoveGitHubRepoPayload'
import {getUserId, isTeamLead, isTeamMember} from 'server/utils/authorization'
import {GITHUB} from 'universal/utils/constants'
import archiveTasksByGitHubRepo from 'server/safeMutations/archiveTasksByGitHubRepo'
import standardError from 'server/utils/standardError'

export default {
  name: 'RemoveGitHubRepo',
  description: 'Remove a github repo integration from a team',
  type: new GraphQLNonNull(RemoveGitHubRepoPayload),
  args: {
    githubIntegrationId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (source, {githubIntegrationId}, {authToken, socketId: mutatorId, dataLoader}) => {
    const r = getRethink()
    const now = new Date()

    // AUTH
    const viewerId = getUserId(authToken)
    const integration = await r.table(GITHUB).get(githubIntegrationId)
    if (!integration) {
      return standardError(new Error('GitHub provider not found'), {userId: viewerId})
    }
    const {adminUserId, teamId, isActive, nameWithOwner} = integration
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    if (!isActive) {
      return standardError(new Error('Integration already removed'), {userId: viewerId})
    }

    if (adminUserId !== viewerId) {
      if (!(await isTeamLead(viewerId, teamId))) {
        return standardError(new Error('Not team lead'), {userId: viewerId})
      }
    }

    // RESOLUTION
    await r
      .table(GITHUB)
      .get(githubIntegrationId)
      .update({
        isActive: false,
        userIds: [],
        updatedAt: now
      })

    const archivedTaskIds = await archiveTasksByGitHubRepo(teamId, nameWithOwner, dataLoader)
    const data = {
      deletedId: githubIntegrationId,
      archivedTaskIds
    }
    // TODO publish these changes somewhere
    // getPubSub().publish(`githubRepoRemoved.${teamId}`, {
    //   githubRepoRemoved: data,
    //   mutatorId
    // })
    return data
  }
}
