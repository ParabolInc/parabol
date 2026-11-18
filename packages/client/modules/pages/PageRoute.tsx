import {getRouteApi} from '@tanstack/react-router'
import useDashboardOutlet from '../../components/useDashboardOutlet'
import useQueryRefLease from '../../routing/useQueryRefLease'
import {PageEntry} from './PageEntry'

const routeApi = getRouteApi('/tipTapLayout/privateLayout/dashboardLayout/pages/$pageSlug')

const PageRoute = () => {
  const dashboard = useDashboardOutlet()
  const {queryRef, pageId} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  if (!dashboard) return <PageEntry queryRef={queryRef} viewerRef={null} isPublic pageId={pageId} />
  return <PageEntry queryRef={queryRef} viewerRef={dashboard.viewer} pageId={pageId} />
}

export default PageRoute
