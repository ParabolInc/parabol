import {OrgUserRole, TierEnum} from 'parabol-client/types/graphql'
import getRethink from '../../../database/rethinkDriver'
import Organization from '../../../database/types/Organization'
import OrganizationUser from '../../../database/types/OrganizationUser'
import getDomainFromEmail from '../../../utils/getDomainFromEmail'
import isCompanyDomain from '../../../utils/isCompanyDomain'

export default async function createNewOrg(
  orgId: string,
  orgName: string,
  leaderUserId: string,
  leaderEmail: string
) {
  const r = await getRethink()
  const userDomain = getDomainFromEmail(leaderEmail)
  const activeDomain = isCompanyDomain(userDomain) ? userDomain : undefined
  const org = new Organization({
    id: orgId,
    tier: TierEnum.personal,
    name: orgName,
    activeDomain
  })
  const orgUser = new OrganizationUser({
    orgId,
    userId: leaderUserId,
    role: OrgUserRole.BILLING_LEADER,
    tier: org.tier
  })
  return r({
    org: r.table('Organization').insert(org),
    organizationUser: r.table('OrganizationUser').insert(orgUser)
  }).run()
}
