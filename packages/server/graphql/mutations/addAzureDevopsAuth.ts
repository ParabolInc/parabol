import {GraphQLID, GraphQLNonNull} from 'graphql'
import AddAzureDevopsAuthPayload from '../types/AddAzureDevopsAuthPayload'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import shortid from 'shortid'
import {TEAM} from 'parabol-client/utils/constants'
import getRethink from '../../database/rethinkDriver'
import AzureDevopsManager from '../../utils/AzureDevopsManager'
import standardError from '../../utils/standardError'

export default {
  name: 'AddAzureDevopsAuth',
  type: new GraphQLNonNull(AddAzureDevopsAuthPayload),
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

    const manager = await AzureDevopsManager.init(code)
    const sites = await manager.getAccessibleResources()
    if (!Array.isArray(sites)) {
      return standardError(new Error(sites.message), {userId: viewerId})
    }
    const organizations = sites.map((cloud) => cloud.id)
    const self = await manager.getMyself() //getMyself(organizations[0])
    if (!('accountId' in self)) {
      return standardError(new Error(self.message), {userId: viewerId})
    }
    const {accessToken, refreshToken} = manager

    let azureDevopsAuthId
    const existingAuth = await r
      .table('AzureDevopsAuth')
      .getAll(viewerId, {index: 'userId'})
      .filter({teamId})
      .nth(0)
      .default(null)
    const updateDoc = {
      isActive: true,
      accessToken,
      accountId: self.accountId,
      organizations,
      refreshToken,
      teamId,
      updatedAt: now,
      userId: viewerId
    }
    if (existingAuth) {
      azureDevopsAuthId = existingAuth.id
      await r
        .table('AzureDevopsAuth')
        .get(existingAuth.id)
        .update(updateDoc)
    } else {
      azureDevopsAuthId = shortid.generate()
      await r.table('AzureDevopsAuth').insert({
        ...updateDoc,
        id: azureDevopsAuthId,
        createdAt: now
      })
    }

    const data = {azureDevopsAuthId}
    publish(TEAM, teamId, AddAzureDevopsAuthPayload, data, subOptions)
    return data
  }
}
