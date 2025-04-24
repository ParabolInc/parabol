import sendTeamsLimitEmail from '../../billing/helpers/sendTeamsLimitEmail'
import generateUID from '../../generateUID'
import {DataLoaderWorker} from '../../graphql/graphql'
import isValid from '../../graphql/isValid'
import publishNotification from '../../graphql/public/mutations/helpers/publishNotification'
import getKysely from '../../postgres/getKysely'
import ScheduledTeamLimitsJob from './ScheduledTeamLimitsJob'

const processTeamsLimitsJob = async (job: ScheduledTeamLimitsJob, dataLoader: DataLoaderWorker) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId}
  const {orgId, type} = job
  const [organization, orgUsers] = await Promise.all([
    dataLoader.get('organizations').loadNonNull(orgId),
    dataLoader.get('organizationUsersByOrgId').load(orgId)
  ])
  const {name: orgName, picture: orgPicture, scheduledLockAt, lockedAt} = organization

  if (!scheduledLockAt || lockedAt) return

  const billingLeadersIds = orgUsers
    .filter(({role}) => role && ['BILLING_LEADER', 'ORG_ADMIN'].includes(role))
    .map(({userId}) => userId)
  const billingLeaderUsers = (await dataLoader.get('users').loadMany(billingLeadersIds)).filter(
    isValid
  )
  const emailType = type === 'LOCK_ORGANIZATION' ? 'locked' : 'sevenDayWarning'
  billingLeaderUsers.map((user) => sendTeamsLimitEmail({user, orgId, orgName, emailType}))

  if (type === 'LOCK_ORGANIZATION') {
    const now = new Date()
    await getKysely()
      .updateTable('Organization')
      .set({lockedAt: now})
      .where('id', '=', 'orgId')
      .execute()
    organization.lockedAt = lockedAt
  } else if (type === 'WARN_ORGANIZATION') {
    const notificationsToInsert = billingLeadersIds.map((userId) => ({
      id: generateUID(),
      type: 'TEAMS_LIMIT_REMINDER' as const,
      userId,
      orgId,
      orgName,
      orgPicture,
      scheduledLockAt
    }))

    await getKysely().insertInto('Notification').values(notificationsToInsert).execute()
    notificationsToInsert.forEach((notification) => {
      publishNotification(notification, subOptions)
    })
  }
}

export default processTeamsLimitsJob
