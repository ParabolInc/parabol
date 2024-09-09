import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import {MutationResolvers} from '../resolverTypes'

const removeApprovedOrganizationDomains: MutationResolvers['removeApprovedOrganizationDomains'] =
  async (_source, {emailDomains, orgId}) => {
    // VALIDATION
    const normalizedEmailDomains = emailDomains.map((domain) => domain.toLowerCase().trim())

    // RESOLUTION
    const pg = getKysely()

    await pg
      .updateTable('OrganizationApprovedDomain')
      .set({removedAt: sql`CURRENT_TIMESTAMP`})
      .where('orgId', '=', orgId)
      .where('domain', 'in', normalizedEmailDomains)
      .execute()

    const data = {orgId}
    return data
  }

export default removeApprovedOrganizationDomains
