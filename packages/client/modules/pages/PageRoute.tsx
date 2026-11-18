import useDashboardOutlet from '../../components/useDashboardOutlet'
import PageRoot from './PageRoot'

const PageRoute = () => {
  const dashboard = useDashboardOutlet()
  if (!dashboard) return <PageRoot viewerRef={null} isPublic />
  return <PageRoot viewerRef={dashboard.viewer} />
}

export default PageRoute
