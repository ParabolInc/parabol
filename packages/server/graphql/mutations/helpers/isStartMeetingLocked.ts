import isValid from '../../../graphql/isValid'
import {DataLoaderWorker} from '../../graphql'

const isStartMeetingLocked = async (teamId: string, dataLoader: DataLoaderWorker) => {
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const {lockMessageHTML, orgId, tier} = team
  const orgTeams = await dataLoader.get('teamsByOrgIds').load(orgId)
  const anyOrgTeamIsLocked = orgTeams.some((team) => !team.isPaid)
  if (tier !== 'personal' && anyOrgTeamIsLocked) {
    // if this team was manually locked, be mean because they called this by hiding the modal
    return lockMessageHTML
      ? 'Wow, you’re determined to use Parabol! That’s awesome! Do you want to keep sneaking over the gate, or walk through the door with our Sales team?'
      : 'Sorry! We are unable to start your meeting because your organization has an overdue payment'
  }
  // if this team wasn't manually locked, see if any of its members are on locked teams
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  const userIds = teamMembers.map(({userId}) => userId)
  const allTeamMembers = (await dataLoader.get('teamMembersByUserId').loadMany(userIds))
    .filter(isValid)
    .flat()
  const teamIds = [...new Set(allTeamMembers.map(({teamId}) => teamId))]
  const allRelatedTeams = (await dataLoader.get('teams').loadMany(teamIds)).filter(isValid)
  const anyTeamIsLocked = allRelatedTeams.some((team) => team.isPaid === false)
  return anyTeamIsLocked
    ? 'One or more of your team members is over the usage limit. Please contact sales'
    : null
}

export default isStartMeetingLocked
