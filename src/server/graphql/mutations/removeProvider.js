import {GraphQLID, GraphQLNonNull} from 'graphql'
import {fromGlobalId, toGlobalId} from 'graphql-relay'
import getRethink from 'server/database/rethinkDriver'
import RemoveProviderPayload from 'server/graphql/types/RemoveProviderPayload'
import getProviderRowData from 'server/safeQueries/getProviderRowData'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import {GITHUB, INTEGRATION, SLACK} from 'universal/utils/constants'
import archiveTasksForManyRepos from 'server/safeMutations/archiveTasksForManyRepos'
import removeGitHubReposForUserId from 'server/safeMutations/removeGitHubReposForUserId'
import publish from 'server/utils/publish'
import standardError from 'server/utils/standardError'

const getPayload = async (service, integrationChanges, teamId, userId) => {
  const deletedIntegrationIds = integrationChanges
    .filter((change) => !change.new_val.isActive)
    .map((change) => toGlobalId(service, change.new_val.id))
  const rowDetails = await getProviderRowData(service, teamId)
  return {
    providerRow: {
      ...rowDetails,
      accessToken: null,
      service,
      teamId: `_${teamId}`
    },
    deletedIntegrationIds,
    userId
  }
}

export default {
  name: 'RemoveProvider',
  type: new GraphQLNonNull(RemoveProviderPayload),
  description: 'Disconnect a team from a Provider token',

  args: {
    providerId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The relay id of the service to remove'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the teamId to disconnect from the token'
    }
  },
  resolve: async (source, {providerId, teamId}, {authToken, socketId: mutatorId, dataLoader}) => {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)
    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    const {id: dbProviderId} = fromGlobalId(providerId)
    // unlink the team from the user's token
    const res = await r
      .table('Provider')
      .get(dbProviderId)
      .update(
        {
          isActive: false
        },
        {returnChanges: true}
      )

    if (res.skipped === 1) {
      return standardError(new Error('Integration not found'), {userId: viewerId})
    }

    // remove the user from every integration under the service
    const updatedProvider = res.changes[0]
    if (!updatedProvider) {
      return standardError(new Error(`Provider ${providerId} did not contain ${teamId}`), {
        userId: viewerId
      })
    }
    const {service} = updatedProvider.new_val
    const userId = getUserId(authToken)
    let data
    if (service === SLACK) {
      const channelChanges = await r
        .table(SLACK)
        .getAll(teamId, {index: 'teamId'})
        .filter({isActive: true})
        .update(
          {
            isActive: false
          },
          {returnChanges: true}
        )('changes')
        .default([])
      data = await getPayload(service, channelChanges, teamId, userId)
    } else if (service === GITHUB) {
      const repoChanges = await removeGitHubReposForUserId(userId, [teamId])
      data = await getPayload(service, repoChanges, teamId, userId)
      const archivedTasksByRepo = await archiveTasksForManyRepos(repoChanges)
      data.archivedTaskIds = archivedTasksByRepo.reduce((arr, repoArr) => {
        arr.push(...repoArr)
        return arr
      }, [])
    }
    publish(INTEGRATION, teamId, RemoveProviderPayload, data, subOptions)
    return data
  }
}
