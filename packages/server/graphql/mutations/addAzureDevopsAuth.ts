import {GraphQLID, GraphQLNonNull} from 'graphql'
import AddAzureDevopsAuthPayload from '../types/AddAzureDevopsAuthPayload'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import shortid from 'shortid'
import getRethink from '../../database/rethinkDriver'
import AzureDevopsManager from '../../utils/AzureDevopsManager'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

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
    const r = await getRethink()
    const now = new Date()

    const manager = await AzureDevopsManager.init(code)
    // const manager = new AzureDevopsManager('', '')

    // TODO: List Accounts
    // const sites = await manager.getAz getAccessibleResources()
    // if (!Array.isArray(sites)) {
    //   return standardError(new Error(sites.message), {userId: viewerId})
    // }
    const accounts = await manager.getAzureDevOpsAccounts()
    if (!Array.isArray(accounts)) {
      return standardError(new Error(accounts.message), {userId: viewerId})
    }

    // const organizations = sites.map((cloud) => cloud.id)
    // const self = await manager.getMyself() //getMyself(organizations[0])
    // if (!('accountId' in self)) {
    //   return standardError(new Error(self.message), {userId: viewerId})
    // }
    // const {accessToken, refreshToken} = manager

    // AccountId: string
    // NamespaceId: string
    // AccountName: string

    const organizations = accounts.map((organization) => [
      organization.AccountId,
      organization.AccountName
    ])
    const self = await manager.getMyAzureDevopsProfile()
    if (!('id' in self)) {
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
      .run()
    const updateDoc = {
      isActive: true,
      accessToken,
      profileId: self.id,
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
        .run()
    } else {
      azureDevopsAuthId = shortid.generate()
      await r
        .table('AzureDevopsAuth')
        .insert({
          ...updateDoc,
          id: azureDevopsAuthId,
          createdAt: now
        })
        .run()
    }

    const data = {azureDevopsAuthId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddAzureDevopsAuthPayload', data, subOptions)
    return data
  }
}
