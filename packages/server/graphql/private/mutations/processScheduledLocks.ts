import ms from 'ms'
import sendTeamsLimitEmail from '../../../billing/helpers/sendTeamsLimitEmail'
import getRethink from '../../../database/rethinkDriver'
import {GQLContext} from '../../graphql'
import isValid from '../../isValid'

// const processScheduledLocks: MutationResolvers['runScheduledJobs'] = async (
const processScheduledLocks = async (_source, _args, {dataLoader}: GQLContext) => {
  const r = await getRethink()
  const now = new Date().getTime()
  const inOneWeek = now + ms('7d')
  const inSixDays = now + ms('6d')

  // RESOLUTION
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
  console.log('🚀 ~ orgsScheduledForLockWithinWeek', orgsScheduledForLockWithinWeek)

  const orgsToBeLocked = orgsScheduledForLockWithinWeek.filter(
    (org) => org.scheduledLockAt!.getTime() < now
  )
  const orgIdsToBeLocked = orgsToBeLocked.map(({id}) => id)

  const orgsToBeWarned = orgsScheduledForLockWithinWeek.filter((org) => {
    const scheduledLockAt = org.scheduledLockAt!.getTime()
    return inSixDays <= scheduledLockAt && scheduledLockAt < inOneWeek
  })
  const orgIdsToBeWarned = orgsToBeWarned.map(({id}) => id)

  const [orgUsersToBeLocked, teamsToBeLocked, orgUsersToBeWarned, teamsToBeWarned] =
    await Promise.all([
      dataLoader.get('organizationUsersByOrgId').loadMany(orgIdsToBeLocked),
      dataLoader.get('teamsByOrgIds').loadMany(orgIdsToBeLocked),
      dataLoader.get('organizationUsersByOrgId').loadMany(orgIdsToBeWarned),
      dataLoader.get('teamsByOrgIds').loadMany(orgIdsToBeWarned),
      r
        .table('Organization')
        .getAll(r.args(orgIdsToBeLocked))
        // .update({
        //   lockedAt: new Date()
        // })
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

  // users in db dont have orgId
  // get the orgUsers in the relevant org
  // then get the user so we have the preferred name and email
  const [billingLeadersToBeLocked, billingLeadersToBeWarned] = await Promise.all([
    dataLoader.get('users').loadMany(billingLeaderOrgUserIdsToBeLocked),
    dataLoader.get('users').loadMany(billingLeaderOrgUserIdsToBeWarned)
  ])

  await Promise.all([
    orgsToBeLocked.flatMap(({id: orgId, name: orgName}) => {
      // TODO: need to make sure these users are unique
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
      // TODO: need to make sure these users are unique
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

  console.log('🚀 ~ billingLeaderUserIdsToBeLocked', {
    billingLeadersToBeLocked,
    billingLeadersToBeWarned,
    orgIdsToBeWarned,
    orgIdsToBeLocked
  })

  return true
}

export default processScheduledLocks
