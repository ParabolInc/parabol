import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import adjustUserCount from '../../billing/helpers/adjustUserCount'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isSuperUser} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {OrgUserRole} from 'parabol-client/types/graphql'
import {InvoiceItemType} from 'parabol-client/types/constEnums'

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
  async resolve (_source, {teamId, orgId}, {authToken}) {
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
    const isBillingLeaderForOrg = newOrganizationUser.role === OrgUserRole.BILLING_LEADER
    if (!isBillingLeaderForOrg && !su) {
      return standardError(new Error('Not organization leader'), {userId})
    }
    const {orgId: currentOrgId} = team
    const oldOrganizationUser = await r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .filter({orgId: currentOrgId, removedAt: null})
      .nth(0)
    const isBillingLeaderForTeam = oldOrganizationUser.role === OrgUserRole.BILLING_LEADER
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
      return adjustUserCount(newUserId, orgId, InvoiceItemType.ADD_USER)
    })
    const inactiveUserIds = await r
      .table('User')
      .getAll(newToOrgUserIds, {index: 'id'})
      .filter({inactive: true})('id')

    inactiveUserIds.map((newInactiveUserId) => {
      return adjustUserCount(newInactiveUserId, orgId, InvoiceItemType.AUTO_PAUSE_USER)
    })

    const inactiveAdded = inactiveUserIds.length
    const activeAdded = newToOrgUserIds.length - inactiveAdded
    return `${inactiveAdded} inactive users and ${activeAdded} active users added to org ${orgId}`
  }
}
