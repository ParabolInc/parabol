import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import adjustUserCount from 'server/billing/helpers/adjustUserCount'
import getRethink from 'server/database/rethinkDriver'
import {getUserId, isSuperUser} from 'server/utils/authorization'
import {ADD_USER, AUTO_PAUSE_USER} from 'server/utils/serverConstants'
import {BILLING_LEADER} from 'universal/utils/constants'
import standardError from 'server/utils/standardError'

export default {
  type: GraphQLString,
  description: 'Move a team to a different org. Requires billing leader rights on both orgs!',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId that you want to move'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the organization you want to move the team to'
    }
  },
  async resolve (source, {teamId, orgId}, {authToken}) {
    const r = getRethink()
    // AUTH
    const userId = getUserId(authToken)
    const su = isSuperUser(authToken)

    // VALIDATION
    const {team, org, newOrganizationUser} = await r({
      team: r.table('Team').get(teamId),
      org: r.table('Organization').get(orgId),
      newOrganizationUser: r
        .table('OrganizationUser')
        .getAll(userId, {index: 'userId'})
        .filter({orgId, removedAt: null})
        .nth(0)
    })
    const isBillingLeaderForOrg = newOrganizationUser.role === BILLING_LEADER
    if (!isBillingLeaderForOrg && !su) {
      return standardError(new Error('Not organization leader'), {userId})
    }
    const {orgId: currentOrgId} = team
    const oldOrganizationUser = await r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .filter({orgId: currentOrgId, removedAt: null})
      .nth(0)
    const isBillingLeaderForTeam = oldOrganizationUser.role === BILLING_LEADER
    if (!isBillingLeaderForTeam && !su) {
      return standardError(new Error('Not organization leader'), {userId})
    }

    if (orgId === currentOrgId && !su) {
      return standardError(new Error('Team already on organization'), {userId})
    }

    // RESOLUTION
    const {newToOrgUserIds} = await r({
      notifications: r
        .table('Notification')
        .getAll(currentOrgId, {index: 'orgId'})
        .filter({teamId})
        .update({orgId}),
      orgApprovals: r
        .table('OrgApproval')
        .getAll(teamId, {index: 'teamId'})
        .update({orgId}),
      team: r
        .table('Team')
        .get(teamId)
        .update({
          orgId,
          isPaid: Boolean(org.stripeSubscriptionId),
          tier: org.tier
        }),
      newToOrgUserIds: r
        .table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({isNotRemoved: true})
        .filter((teamMember) => {
          return r
            .table('OrganizationUser')
            .getAll(teamMember('userId'), {index: 'userId'})
            .filter({orgId, removedAt: null})
            .count()
            .eq(0)
        })('userId')
        .coerceTo('array')
    })

    newToOrgUserIds.map((newUserId) => {
      return adjustUserCount(newUserId, orgId, ADD_USER)
    })
    const inactiveUserIds = await r
      .table('User')
      .getAll(newToOrgUserIds, {index: 'id'})
      .filter({inactive: true})('id')

    inactiveUserIds.map((newInactiveUserId) => {
      return adjustUserCount(newInactiveUserId, orgId, AUTO_PAUSE_USER)
    })

    const inactiveAdded = inactiveUserIds.length
    const activeAdded = newToOrgUserIds.length - inactiveAdded
    return `${inactiveAdded} inactive users and ${activeAdded} active users added to org ${orgId}`
  }
}
