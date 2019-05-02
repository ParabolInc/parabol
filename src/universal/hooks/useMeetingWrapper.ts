import {useToggleSidebar} from 'universal/hooks/newMeeting'
import useSwarm from 'universal/hooks/useSwarm'

interface Team {
  id: string
  isMeetingSidebarCollapsed: boolean | null
}

const useMeetingWrapper = (team: Team) => {
  const {id: teamId, isMeetingSidebarCollapsed} = team
  const toggleSidebar = useToggleSidebar(teamId, !!isMeetingSidebarCollapsed)
  const {streams, swarm} = useSwarm(teamId)
  return {toggleSidebar, streams, swarm}
}

export default useMeetingWrapper
