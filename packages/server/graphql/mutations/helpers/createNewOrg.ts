import getRethink from '../../../database/rethinkDriver'
import shortid from 'shortid'
import {OrgUserRole, TierEnum} from 'parabol-client/types/graphql'

export default async function createNewOrg (orgId, orgName, leaderUserId) {
  const r = getRethink()
  const now = new Date()
  return r({
    org: r.table('Organization').insert({
      id: orgId,
      creditCard: {},
      createdAt: now,
      name: orgName,
      tier: TierEnum.personal,
      updatedAt: now
    }),
    organizationUser: r.table('OrganizationUser').insert({
      id: shortid.generate(),
      inactive: false,
      joinedAt: now,
      newUserUntil: now,
      orgId,
      removedAt: null,
      role: OrgUserRole.BILLING_LEADER,
      userId: leaderUserId
    })
  })
}
