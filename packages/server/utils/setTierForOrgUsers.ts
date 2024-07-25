/*
 * We only need to update on `OrganizationUser` objects
 * with `removedAt = null`. Why? `OrganizationUser` row
 * represents one instance of a "membership joining".
 * Once `removedAt` field is populated, that `OrganizationUser`
 * row will not be used again. In case the user is re-invited
 * and rejoins the same org, a new `OrganizationUser` row
 * will be created.
 */
import getKysely from '../postgres/getKysely'

const setTierForOrgUsers = async (orgId: string) => {
  const pg = getKysely()
  const organization = await getKysely()
    .selectFrom('Organization')
    .select(['trialStartDate', 'tier'])
    .where('id', '=', orgId)
    .executeTakeFirstOrThrow()
  const {tier, trialStartDate} = organization
  await pg
    .updateTable('OrganizationUser')
    .set({tier, trialStartDate})
    .where('orgId', '=', orgId)
    .where('removedAt', 'is', null)
    .execute()
}

export default setTierForOrgUsers
