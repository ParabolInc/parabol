import {GraphQLID, GraphQLNonNull} from 'graphql'
import AddAtlassianAuthPayload from '../types/AddAtlassianAuthPayload'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import shortid from 'shortid'
import {TEAM} from '../../../universal/utils/constants'
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
    if (!Array.isArray(sites)) {
      return standardError(new Error(sites.message), {userId: viewerId})
    }
    const cloudIds = sites.map((cloud) => cloud.id)
    const self = await manager.getMyself(cloudIds[0])
    if (!('accountId' in self)) {
      return standardError(new Error(self.message), {userId: viewerId})
    }
    const {accessToken, refreshToken} = manager

    let atlassianAuthId
    const existingAuth = await r
      .table('AtlassianAuth')
      .getAll(viewerId, {index: 'userId'})
      .filter({teamId})
      .nth(0)
      .default(null)
    const updateDoc = {
      isActive: true,
      accessToken,
      accountId: self.accountId,
      cloudIds,
      refreshToken,
      teamId,
      updatedAt: now,
      userId: viewerId
    }
    if (existingAuth) {
      atlassianAuthId = existingAuth.id
      await r
        .table('AtlassianAuth')
        .get(existingAuth.id)
        .update(updateDoc)
    } else {
      atlassianAuthId = shortid.generate()
      await r.table('AtlassianAuth').insert({
        ...updateDoc,
        id: atlassianAuthId,
        createdAt: now
      })
    }

    const data = {atlassianAuthId}
    publish(TEAM, teamId, AddAtlassianAuthPayload, data, subOptions)
    return data
  }
}
