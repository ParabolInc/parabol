import TeamDashTasksTab from '../TeamDashTasksTab/TeamDashTasksTab'
import useTeamDashMainOutlet from './useTeamDashMainOutlet'

const TeamDashTasksRoute = () => {
  const {viewer} = useTeamDashMainOutlet()
  return <TeamDashTasksTab viewerRef={viewer} />
}

export default TeamDashTasksRoute
