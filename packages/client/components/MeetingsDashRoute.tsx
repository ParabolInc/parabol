import MeetingsDash from './MeetingsDash'
import useDashboardOutlet from './useDashboardOutlet'

const MeetingsDashRoute = () => {
  const dashboard = useDashboardOutlet()
  if (!dashboard) return null
  return <MeetingsDash meetingsDashRef={dashboard.mainRef} viewer={dashboard.viewer} />
}

export default MeetingsDashRoute
