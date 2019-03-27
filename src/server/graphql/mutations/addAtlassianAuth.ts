import {GraphQLID, GraphQLNonNull} from 'graphql'
import AddAtlassianAuthPayload from 'server/graphql/types/AddAtlassianAuthPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import shortid from 'shortid'
import {TEAM} from 'universal/utils/constants'
import getRethink from '../../database/rethinkDriver'
import AtlassianManager from '../../utils/AtlassianManager'
import standardError from '../../utils/standardError'

export default {
  name: 'AddAtlassianAuth',
  type: new GraphQLNonNull(AddAtlassianAuthPayload),
  args: {
    code: {
      type: new GraphQLNonNull(GraphQLID)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (_source, {code, teamId}, {authToken, socketId: mutatorId, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
    }

    // RESOLUTION
    const r = getRethink()
    const now = new Date()

    const manager = await AtlassianManager.init(code)
    const sites = await manager.getAccessibleResources()
    const cloudIds = sites.map((cloud) => cloud.id)
    const self = await manager.getMyself(cloudIds[0])
    const {accessToken} = manager

    let atlassianAuthId
    const existingAuth = await r
      .table('AtlassianAuth')
      .getAll(viewerId, {index: 'userId'})
      .filter({teamId})
      .nth(0)
      .default(null)
    if (existingAuth) {
      atlassianAuthId = existingAuth.id
      await r
        .table('AtlassianAuth')
        .get(existingAuth.id)
        .update({
          accessToken,
          updatedAt: now
        })
    } else {
      atlassianAuthId = shortid.generate()
      await r.table('AtlassianAuth').insert({
        id: atlassianAuthId,
        accessToken,
        cloudIds,
        createdAt: now,
        updatedAt: now,
        teamId,
        userId: viewerId,
        atlassianUserId: self.accountId
      })
    }

    // TODO auto join existing projects

    const data = {atlassianAuthId}
    publish(TEAM, teamId, AddAtlassianAuthPayload, data, subOptions)
    return data
  }
}
