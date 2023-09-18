import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'
import normalizeSlugName from './helpers/normalizeSlugName'

const verifyDomain: MutationResolvers['verifyDomain'] = async (
  _source,
  {slug, addDomains, orgId, removeDomains},
  {authToken, dataLoader}
) => {
  const pg = getKysely()
  const viewerId = getUserId(authToken)
  const domainsToAdd = addDomains?.map((domain) => domain.toLowerCase()) ?? []
  const domainsToRemove = removeDomains?.map((domain) => domain.toLowerCase()) ?? []

  // VALIDATION
  const slugName = normalizeSlugName(slug)
  if (slugName instanceof Error) return {error: {message: slugName.message}}
  const existingRowForOrgId = await dataLoader.get('samlByOrgId').load(orgId)
  dataLoader.get('samlByOrgId').clear(orgId)
  const existingSlugName = existingRowForOrgId?.id
  if (existingSlugName && existingSlugName !== slugName) {
    return {
      error: {
        message: `orgId ${orgId} is already controlled by ${existingSlugName}. You must first update ${existingSlugName} with a new orgId`
      }
    }
  }
  await pg.transaction().execute(async (trx) => {
    // upsert the record with orgId
    await trx
      .insertInto('SAML')
      .values({
        id: slugName,
        orgId,
        lastUpdatedBy: viewerId
      })
      .onConflict((oc) => oc.column('id').doUpdateSet({lastUpdatedBy: viewerId, orgId}))
      .returning('id')
      .executeTakeFirst()
    if (domainsToRemove.length > 0) {
      await trx.deleteFrom('SAMLDomain').where('domain', 'in', domainsToRemove).execute()
    }
    if (domainsToAdd.length > 0) {
      const values = domainsToAdd.map((domain) => ({
        domain,
        samlId: slugName
      }))
      await trx
        .insertInto('SAMLDomain')
        .values(values)
        .onConflict((oc) => oc.column('domain').doUpdateSet({samlId: slugName}))
        .execute()
    }
  })
  return {samlId: slugName}
}

export default verifyDomain
