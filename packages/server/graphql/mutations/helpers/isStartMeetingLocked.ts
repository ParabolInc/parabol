import {Threshold} from '~/types/constEnums'
import {DataLoaderWorker} from '../../graphql'

const isStartMeetingLocked = async (teamId: string, dataLoader: DataLoaderWorker) => {
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const organization = await dataLoader.get('organizations').load(team.orgId)

  const {lockedAt: organizationLockedAt, name: organizationName} = organization
  const {isPaid, lockMessageHTML} = team

  if (!isPaid) {
    return lockMessageHTML
      ? 'Wow, you’re determined to use Parabol! That’s awesome! Do you want to keep sneaking over the gate, or walk through the door with our Sales team?'
      : 'Sorry! We are unable to start your meeting because your team has an overdue payment'
  } else if (organizationLockedAt) {
    return `Unfortunately, ${organizationName} has exceeded the ${Threshold.MAX_STARTER_TIER_TEAMS} teams limit on the Starter Plan for more than ${Threshold.STARTER_TIER_LOCK_AFTER_DAYS} days, and your account has been locked. You can re-activate your teams by upgrading your account.`
  }

  return null
}

export default isStartMeetingLocked
