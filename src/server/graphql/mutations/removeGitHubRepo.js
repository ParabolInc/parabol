import {GraphQLID, GraphQLNonNull} from 'graphql'
import {fromGlobalId} from 'graphql-relay'
import getRethink from 'server/database/rethinkDriver'
import RemoveGitHubRepoPayload from 'server/graphql/types/RemoveGitHubRepoPayload'
import {getUserId, isTeamLead, isTeamMember} from 'server/utils/authorization'
import getPubSub from 'server/utils/getPubSub'
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
    githubGlobalId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (source, {githubGlobalId}, {authToken, socketId: mutatorId, dataLoader}) => {
    const r = getRethink()
    const {id} = fromGlobalId(githubGlobalId)

    // AUTH
    const viewerId = getUserId(authToken)
    const integration = await r.table(GITHUB).get(id)
    if (!integration) {
      return sendGitHubProviderNotFoundError(authToken, {
        globalId: githubGlobalId
      })
    }
    const {teamId, isActive, userIds, nameWithOwner} = integration
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId)
    }

    // VALIDATION
    if (!isActive) {
      return sendAlreadyRemovedIntegrationError(authToken, githubGlobalId)
    }

    if (!userIds.includes(viewerId)) {
      if (!(await isTeamLead(viewerId, teamId))) {
        return sendTeamLeadAccessError(authToken, teamId)
      }
    }

    // RESOLUTION
    await r
      .table(GITHUB)
      .get(id)
      .update({
        isActive: false,
        userIds: []
      })

    const archivedTaskIds = await archiveTasksByGitHubRepo(teamId, nameWithOwner, dataLoader)
    const githubRepoRemoved = {
      deletedId: githubGlobalId,
      archivedTaskIds
    }
    getPubSub().publish(`githubRepoRemoved.${teamId}`, {
      githubRepoRemoved,
      mutatorId
    })
    return githubRepoRemoved
  }
}
