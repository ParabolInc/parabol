import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import RemoveGitHubAuthPayload from 'server/graphql/types/RemoveGitHubAuthPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import standardError from 'server/utils/standardError'
import {GITHUB, TEAM} from 'universal/utils/constants'

export default {
  name: 'RemoveGitHubAuth',
  type: new GraphQLNonNull(RemoveGitHubAuthPayload),
  description: 'Disconnect a team member from GitHub',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the teamId to disconnect from the token'
    }
  },
  resolve: async (_source, {teamId}, {authToken, socketId: mutatorId, dataLoader}) => {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)
    const now = new Date()

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    const existingAuth = await r
      .table('Provider')
      .getAll(teamId, {index: 'teamId'})
      .filter({service: GITHUB, userId: viewerId})
      .nth(0)
      .default(null)

    if (!existingAuth) {
      return standardError(new Error('Auth not found'), {userId: viewerId})
    }

    const authId = existingAuth.id
    await r
      .table('Provider')
      .get(authId)
      .update({accessToken: null, isActive: false, updatedAt: now})

    const data = {authId, teamId, userId: viewerId}
    publish(TEAM, teamId, RemoveGitHubAuthPayload, data, subOptions)
    return data
  }
}
