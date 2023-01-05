import ms from 'ms'
import getRethink from '../../../database/rethinkDriver'
import getMailManager from '../../../email/getMailManager'
import resetPasswordEmailCreator from '../../../email/resetPasswordEmailCreator'
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

  const orgIdsToBeLocked = orgsScheduledForLockWithinWeek
    .filter((org) => {
      const scheduledLockAt = org.scheduledLockAt!.getTime()
      return scheduledLockAt < now
    })
    .map(({id}) => id)

  const orgIdsToBeWarned = orgsScheduledForLockWithinWeek
    .filter((org) => {
      const scheduledLockAt = org.scheduledLockAt!.getTime()
      return inSixDays <= scheduledLockAt && scheduledLockAt < inOneWeek
    })
    .map(({id}) => id)

  const [orgUsersToBeLocked, orgUsersToBeWarned] = await Promise.all([
    dataLoader.get('organizationUsersByOrgId').loadMany(orgIdsToBeLocked),
    dataLoader.get('organizationUsersByOrgId').loadMany(orgIdsToBeWarned),
    r
      .table('Organization')
      .getAll(r.args(orgIdsToBeLocked))
      // .update({
      //   lockedAt: new Date()
      // })
      .run()
  ])

  // const billingLeaderUserIdsToBeLocked = orgUsersToBeLocked.filter(isValid).map((orgUsers) => {
  //   return orgUsers.filter((orgUser) => orgUser.role === 'BILLING_LEADER').map(({userId}) => userId)
  // })

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

  await Promise.all(
    orgIdsToBeLocked.flatMap((orgId) => {
      // TODO: need to make sure these users are unique
      const billingLeaderOrgUserIds = billingLeaderOrgUsersToBeLocked
        .filter((orgUser) => orgUser.orgId === orgId)
        .map(({userId}) => userId)

      const billingLeaderUsers = billingLeadersToBeLocked
        .filter(isValid)
        .filter((user) => billingLeaderOrgUserIds.includes(user.id))

      return billingLeaderUsers.map((user) => {
        const {preferredName, email} = user
        const {subject, body, html} = resetPasswordEmailCreator({orgId, preferredName})
        return getMailManager().sendEmail({
          to: email,
          subject,
          body,
          html
        })
      })
    })
  )

  // TODO: add to be warned

  console.log('🚀 ~ billingLeaderUserIdsToBeLocked', {
    billingLeadersToBeLocked,
    billingLeadersToBeWarned
  })

  return true
}

export default processScheduledLocks
