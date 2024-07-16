import isValid from '../graphql/isValid'
import getKysely from '../postgres/getKysely'
import {analytics} from './analytics/analytics'

// MK: this is crazy spaghetti & needs to go away. See https://github.com/ParabolInc/parabol/issues/9932

// This doesn't actually read any tier/trial fields on the 'OrganizationUser' object - these fields
// come directly from 'Organization' instead. As a result, this can be run in parallel with
// 'setTierForOrgUsers'.

const setUserTierForUserId = async (userId: string) => {
  const pg = getKysely()
  const orgUsers = await pg
    .selectFrom('OrganizationUser')
    .selectAll()
    .where('userId', '=', userId)
    .where('removedAt', 'is', null)
    .execute()

  const orgIds = orgUsers.map((orgUser) => orgUser.orgId)
  if (orgIds.length === 0) return

  const organizations = await pg
    .selectFrom('Organization')
    .select(['trialStartDate', 'tier'])
    .where('id', 'in', orgIds)
    .execute()

  const allTiers = organizations.map((org) => org.tier)
  const allTrialStartDates = organizations
    .map((org) => org.trialStartDate?.getTime())
    .filter(isValid)
  const maxTrialStartDate = Math.max(...allTrialStartDates)
  const trialStartDate = maxTrialStartDate > 0 ? new Date(maxTrialStartDate) : null
  const highestTier = allTiers.includes('enterprise')
    ? 'enterprise'
    : allTiers.includes('team')
      ? 'team'
      : 'starter'

  await pg
    .updateTable('User')
    .set({
      tier: highestTier,
      trialStartDate
    })
    .where('id', '=', userId)
    .execute()
  const user = await pg
    .selectFrom('User')
    .select('email')
    .where('id', '=', userId)
    .executeTakeFirstOrThrow()

  analytics.identify({
    userId,
    email: user.email,
    highestTier
  })
}

const setUserTierForUserIds = async (userIds: string[]) => {
  return await Promise.all(userIds.map(setUserTierForUserId))
}

export default setUserTierForUserIds
