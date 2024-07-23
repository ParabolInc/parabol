import Organization from '../../../database/types/Organization'
import generateUID from '../../../generateUID'
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
  const userDomain = getDomainFromEmail(leaderEmail)
  const isCompanyDomain = await dataLoader.get('isCompanyDomain').load(userDomain)
  const activeDomain = isCompanyDomain ? userDomain : undefined
  const org = new Organization({
    id: orgId,
    name: orgName,
    activeDomain
  })
  await insertOrgUserAudit([orgId], leaderUserId, 'added')
  await getKysely()
    .with('Org', (qc) => qc.insertInto('Organization').values({...org, creditCard: null}))
    .insertInto('OrganizationUser')
    .values({
      id: generateUID(),
      orgId,
      userId: leaderUserId,
      role: 'BILLING_LEADER',
      tier: org.tier
    })
    .execute()
}
