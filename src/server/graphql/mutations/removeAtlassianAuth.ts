import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import RemoveAtlassianAuthPayload from 'server/graphql/types/RemoveAtlassianAuthPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import standardError from 'server/utils/standardError'
import {TEAM} from 'universal/utils/constants'

export default {
  name: 'RemoveAtlassianAuth',
  type: new GraphQLNonNull(RemoveAtlassianAuthPayload),
  description: 'Disconnect a team member from atlassian',
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

    const existingToken = await r
      .table('AtlassianAuth')
      .getAll(viewerId, {index: 'userId'})
      .filter({teamId})
      .nth(0)
      .default(null)

    if (!existingToken) {
      return standardError(new Error('Auth not found'), {userId: viewerId})
    }

    const authId = existingToken.id
    await r
      .table('AtlassianAuth')
      .get(authId)
      .update({accessToken: null, refreshToken: null, updatedAt: now})

    // TODO remove the user from every integration under the service
    const projectIds = await r
      .table('AtlassianProject')
      .getAll(viewerId, {index: 'userIds'})
      .filter({teamId})
      .update(
        (project) => ({
          userIds: project('userIds').difference([viewerId])
        }),
        {returnChanges: true}
      )('changes')('new_val')('id')
      .default([])

    if (projectIds.length) {
      await r
        .table('AtlassianProject')
        .getAll(projectIds, {index: 'id'})
        .update((project) => {
          return r.branch(
            // if they were the only person using the integration, archive it
            project('userIds')
              .count()
              .eq(0),
            {
              isActive: false,
              updatedAt: now
            },
            r.branch(
              // if they were admin && there are linked people, promote the first linked person
              project('adminUserId').eq(viewerId),
              {
                adminUserId: project('userIds').nth(0)
              },
              null
            )
          )
        })
    }

    const data = {authId, projectIds, teamId}
    publish(TEAM, teamId, RemoveAtlassianAuthPayload, data, subOptions)
    return data
  }
}
