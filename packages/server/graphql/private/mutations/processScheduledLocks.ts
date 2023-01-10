import ms from 'ms'
import sendTeamsLimitEmail from '../../../billing/helpers/sendTeamsLimitEmail'
import getRethink from '../../../database/rethinkDriver'
import isValid from '../../isValid'
import {MutationResolvers} from '../resolverTypes'

const processScheduledLocks: MutationResolvers['processScheduledLocks'] = async (
  _source,
  _args,
  {dataLoader}
) => {
  const r = await getRethink()
  const now = new Date().getTime()
  const inOneWeek = now + ms('7d')
  const inSixDays = now + ms('6d')

  const orgsScheduledForLockWithinWeek = await r
    .table('Organization')
    .hasFields('scheduledLockAt')
    .filter((row) =>
      row
        .hasFields('lockedAt')
        .not()
        .and(row('scheduledLockAt').lt(r.epochTime(inOneWeek)))
    )
    .run()

  const orgsToBeLocked = orgsScheduledForLockWithinWeek.filter(
    (org) => org.scheduledLockAt!.getTime() < now
  )
  const orgIdsToBeLocked = orgsToBeLocked.map(({id}) => id)

  const orgsToBeWarned = orgsScheduledForLockWithinWeek.filter((org) => {
    const scheduledLockAt = org.scheduledLockAt!.getTime()
    return inSixDays <= scheduledLockAt && scheduledLockAt < inOneWeek
  })
  const orgIdsToBeWarned = orgsToBeWarned.map(({id}) => id)

  const [orgUsersToBeLocked, orgUsersToBeWarned] = await Promise.all([
    dataLoader.get('organizationUsersByOrgId').loadMany(orgIdsToBeLocked),
    dataLoader.get('organizationUsersByOrgId').loadMany(orgIdsToBeWarned),
    r
      .table('Organization')
      .getAll(r.args(orgIdsToBeLocked))
      .update({
        lockedAt: new Date()
      })
      .run()
  ])

  const billingLeaderOrgUsersToBeLocked = orgUsersToBeLocked
    .filter(isValid)
    .flatMap((orgUsers) => orgUsers.filter((orgUser) => orgUser.role === 'BILLING_LEADER'))

  const billingLeaderOrgUsersToBeWarned = orgUsersToBeWarned
    .filter(isValid)
    .flatMap((orgUsers) => orgUsers.filter((orgUser) => orgUser.role === 'BILLING_LEADER'))

  const billingLeaderOrgUserIdsToBeLocked = [
    ...new Set(billingLeaderOrgUsersToBeLocked.map(({userId}) => userId))
  ]

  const billingLeaderOrgUserIdsToBeWarned = [
    ...new Set(billingLeaderOrgUsersToBeWarned.map(({userId}) => userId))
  ]

  const [billingLeadersToBeLocked, billingLeadersToBeWarned] = await Promise.all([
    dataLoader.get('users').loadMany(billingLeaderOrgUserIdsToBeLocked),
    dataLoader.get('users').loadMany(billingLeaderOrgUserIdsToBeWarned)
  ])

  await Promise.all([
    orgsToBeLocked.flatMap(({id: orgId, name: orgName}) => {
      const billingLeaderOrgUserIds = billingLeaderOrgUsersToBeLocked
        .filter((orgUser) => orgUser.orgId === orgId)
        .map(({userId}) => userId)

      const orgBillingLeaders = billingLeadersToBeLocked
        .filter(isValid)
        .filter((user) => billingLeaderOrgUserIds.includes(user.id))

      return orgBillingLeaders.map((user) =>
        sendTeamsLimitEmail({user, orgId, orgName, emailType: 'locked'})
      )
    }),
    orgsToBeWarned.flatMap(({id: orgId, name: orgName}) => {
      const billingLeaderOrgUserIds = billingLeaderOrgUsersToBeWarned
        .filter((orgUser) => orgUser.orgId === orgId)
        .map(({userId}) => userId)

      const orgBillingLeaders = billingLeadersToBeWarned
        .filter(isValid)
        .filter((user) => billingLeaderOrgUserIds.includes(user.id))

      return orgBillingLeaders.map((user) =>
        sendTeamsLimitEmail({user, orgId, orgName, emailType: 'sevenDayWarning'})
      )
    })
  ])

  return true
}

export default processScheduledLocks
