import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import AtlassianServerManager from '../../utils/AtlassianServerManager'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLMutation} from '../graphql'
import AddAtlassianAuthPayload from '../types/AddAtlassianAuthPayload'
import upsertAtlassianAuths from '../../postgres/queries/upsertAtlassianAuths'
import getAtlassianAuthsByUserId from '../../postgres/queries/getAtlassianAuthsByUserId'

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
    const {accessToken, refreshToken, error: oAuthError} = await AtlassianServerManager.init(code)
    if (oAuthError) {
      return standardError(new Error(oAuthError), {userId: viewerId})
    }
    const manager = new AtlassianServerManager(accessToken)
    const sites = await manager.getAccessibleResources()
    if (!Array.isArray(sites)) {
      return standardError(new Error(sites.message), {userId: viewerId})
    }
    const cloudIds = sites.map((cloud) => cloud.id)
    const self = await manager.getMyself(cloudIds[0])
    if (!('accountId' in self)) {
      return standardError(new Error(self.message), {userId: viewerId})
    }

    // if there are the same Jira integrations existing we need to update them with new credentials as well
    // if there's an existing integration for a given user and team (user used an option to refresh the token), skip it as
    // we'll create a new atlassian auth object for it for the upsert
    const userAtlassianAuths = await getAtlassianAuthsByUserId(viewerId)
    const atlassianAuthsToUpdate = userAtlassianAuths
      .filter((auth) => auth.accountId === self.accountId && auth.teamId !== teamId)
      .map((auth) => ({
        ...auth,
        accessToken,
        refreshToken
      }))

    await upsertAtlassianAuths([
      {
        accountId: self.accountId,
        userId: viewerId,
        accessToken,
        refreshToken,
        cloudIds,
        teamId,
        scope: AtlassianServerManager.SCOPE.join(' ')
      },
      ...atlassianAuthsToUpdate
    ])

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
