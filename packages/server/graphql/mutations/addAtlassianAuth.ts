import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import upsertAtlassianAuth from '../../postgres/queries/upsertAtlassianAuth'
import AtlassianServerManager from '../../utils/AtlassianServerManager'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLMutation} from '../graphql'
import AddAtlassianAuthPayload from '../types/AddAtlassianAuthPayload'

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
    const manager = await AtlassianServerManager.init(code)
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

    await upsertAtlassianAuth({
      accountId: self.accountId,
      userId: viewerId,
      accessToken,
      refreshToken,
      cloudIds,
      teamId,
      scope: AtlassianServerManager.SCOPE.join(' ')
    })

    segmentIo.track({
      userId: viewerId,
      event: 'Added Integration',
      properties: {
        teamId,
        service: 'Atlassian'
      }
    })
    const data = {teamId, userId: viewerId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddAtlassianAuthPayload', data, subOptions)
    return data
  }
} as GQLMutation
