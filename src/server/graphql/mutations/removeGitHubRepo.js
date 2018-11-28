import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import RemoveGitHubRepoPayload from 'server/graphql/types/RemoveGitHubRepoPayload'
import {getUserId, isTeamLead, isTeamMember} from 'server/utils/authorization'
import {GITHUB} from 'universal/utils/constants'
import archiveTasksByGitHubRepo from 'server/safeMutations/archiveTasksByGitHubRepo'
import {sendTeamAccessError, sendTeamLeadAccessError} from 'server/utils/authorizationErrors'
import {sendAlreadyRemovedIntegrationError} from 'server/utils/alreadyMutatedErrors'
import {sendGitHubProviderNotFoundError} from 'server/utils/docNotFoundErrors'

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
      return sendGitHubProviderNotFoundError(authToken, {
        githubIntegrationId
      })
    }
    const {adminUserId, teamId, isActive, nameWithOwner} = integration
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId)
    }

    // VALIDATION
    if (!isActive) {
      return sendAlreadyRemovedIntegrationError(authToken, githubIntegrationId)
    }

    if (adminUserId !== viewerId) {
      if (!(await isTeamLead(viewerId, teamId))) {
        return sendTeamLeadAccessError(authToken, teamId)
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
