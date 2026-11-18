import useTeamOutlet from '../containers/Team/useTeamOutlet'
import TeamSettingsRoot from './TeamSettingsRoot'

const TeamSettingsRoute = () => {
  const {teamId} = useTeamOutlet()
  return <TeamSettingsRoot teamId={teamId} />
}

export default TeamSettingsRoute
