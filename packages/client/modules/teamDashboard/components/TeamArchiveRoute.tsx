import ArchiveTaskRoot from '../../../components/ArchiveTaskRoot'
import useTeamOutlet from '../containers/Team/useTeamOutlet'

const TeamArchiveRoute = () => {
  const {team, teamId} = useTeamOutlet()
  return <ArchiveTaskRoot team={team} returnToTeamId={teamId} teamIds={[teamId]} />
}

export default TeamArchiveRoute
