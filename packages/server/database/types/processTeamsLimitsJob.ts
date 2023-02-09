import {r} from 'rethinkdb-ts'
import sendTeamsLimitEmail from '../../billing/helpers/sendTeamsLimitEmail'
import {DataLoaderWorker} from '../../graphql/graphql'
import isValid from '../../graphql/isValid'
import ScheduledTeamLimitsJob from './ScheduledTeamLimitsJob'

const processTeamsLimitsJob = async (job: ScheduledTeamLimitsJob, dataLoader: DataLoaderWorker) => {
  const {orgId, type} = job
  const [organization, orgUsers] = await Promise.all([
    dataLoader.get('organizations').load(orgId),
    dataLoader.get('organizationUsersByOrgId').load(orgId)
  ])
  const {name: orgName, scheduledLockAt, lockedAt} = organization

  if (!scheduledLockAt || lockedAt) return

  const billingLeadersIds = orgUsers
    .filter(({role}) => role === 'BILLING_LEADER')
    .map(({userId}) => userId)
  const billingLeaderUsers = (await dataLoader.get('users').loadMany(billingLeadersIds)).filter(
    isValid
  )
  const emailType = type === 'LOCK_ORGANIZATION' ? 'locked' : 'sevenDayWarning'
  billingLeaderUsers.map((user) => sendTeamsLimitEmail({user, orgId, orgName, emailType}))

  if (type === 'LOCK_ORGANIZATION') {
    const now = new Date()
    await r.table('Organization').get(orgId).update({lockedAt: now}).run()
    organization.lockedAt = lockedAt
  }
}

export default processTeamsLimitsJob
