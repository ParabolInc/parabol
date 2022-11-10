import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId, isUserBillingLeader} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import isValid from '../isValid'
import RemoveOrgUserPayload from '../types/RemoveOrgUserPayload'
import removeFromOrg from './helpers/removeFromOrg'

const removeOrgUser = {
  type: RemoveOrgUserPayload,
  description: 'Remove a user from an org',
  args: {
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the user to remove'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the org that does not want them anymore'
    }
  },
  async resolve(
    _source: unknown,
    {orgId, userId}: {orgId: string; userId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    if (viewerId !== userId) {
      if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
        return standardError(new Error('Must be the organization leader'), {userId: viewerId})
      }
    }

    const {tms, taskIds, kickOutNotificationIds, teamIds, teamMemberIds, organizationUserId} =
      await removeFromOrg(userId, orgId, viewerId, dataLoader)

    publish(SubscriptionChannel.NOTIFICATION, userId, 'AuthTokenPayload', {tms})

    const data = {
      orgId,
      kickOutNotificationIds,
      teamIds,
      teamMemberIds,
      taskIds,
      userId,
      organizationUserId
    }

    publish(SubscriptionChannel.ORGANIZATION, orgId, 'RemoveOrgUserPayload', data, subOptions)
    publish(SubscriptionChannel.NOTIFICATION, userId, 'RemoveOrgUserPayload', data, subOptions)
    teamIds.forEach((teamId) => {
      const teamData = {...data, teamFilterId: teamId}
      publish(SubscriptionChannel.TEAM, teamId, 'RemoveOrgUserPayload', teamData, subOptions)
    })

    const remainingTeamMembers = (await dataLoader.get('teamMembersByTeamId').loadMany(teamIds))
      .filter(isValid)
      .flat()
    remainingTeamMembers.forEach((teamMember) => {
      if (teamMemberIds.includes(teamMember.id)) return
      publish(SubscriptionChannel.TASK, teamMember.userId, 'RemoveOrgUserPayload', data, subOptions)
    })
    return data
  }
}

export default removeOrgUser
