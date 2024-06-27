import getRethink from '../../../database/rethinkDriver'
import Organization from '../../../database/types/Organization'
import OrganizationUser from '../../../database/types/OrganizationUser'
import getKysely from '../../../postgres/getKysely'
import insertOrgUserAudit from '../../../postgres/helpers/insertOrgUserAudit'
import getDomainFromEmail from '../../../utils/getDomainFromEmail'
import {DataLoaderWorker} from '../../graphql'

export default async function createNewOrg(
  orgId: string,
  orgName: string,
  leaderUserId: string,
  leaderEmail: string,
  dataLoader: DataLoaderWorker
) {
  const r = await getRethink()
  const userDomain = getDomainFromEmail(leaderEmail)
  const isCompanyDomain = await dataLoader.get('isCompanyDomain').load(userDomain)
  const activeDomain = isCompanyDomain ? userDomain : undefined
  const org = new Organization({
    id: orgId,
    name: orgName,
    activeDomain
  })
  const orgUser = new OrganizationUser({
    orgId,
    userId: leaderUserId,
    role: 'BILLING_LEADER',
    tier: org.tier
  })
  await insertOrgUserAudit([orgId], leaderUserId, 'added')
  await getKysely()
    .insertInto('Organization')
    .values({...org, creditCard: null})
    .execute()
  return r({
    org: r.table('Organization').insert(org),
    organizationUser: r.table('OrganizationUser').insert(orgUser)
  }).run()
}
