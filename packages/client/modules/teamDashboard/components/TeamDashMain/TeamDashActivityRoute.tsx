import TeamDashActivityTab from '../TeamDashActivityTab/TeamDashActivityTab'
import useTeamDashMainOutlet from './useTeamDashMainOutlet'

const TeamDashActivityRoute = () => {
  const {team} = useTeamDashMainOutlet()
  return <TeamDashActivityTab teamRef={team} />
}

export default TeamDashActivityRoute
