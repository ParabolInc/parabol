import TeamDashIntegrationsTab from '../TeamDashIntegrationsTab/TeamDashIntegrationsTab'
import useTeamDashMainOutlet from './useTeamDashMainOutlet'

const TeamDashIntegrationsRoute = () => {
  const {teamId} = useTeamDashMainOutlet()
  return <TeamDashIntegrationsTab teamRef={teamId} />
}

export default TeamDashIntegrationsRoute
