import {Suspense} from 'react'
import {withRouter} from 'react-router-dom'
import dashboardQuery, {DashboardQuery} from '../__generated__/DashboardQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import useSubscription from '../hooks/useSubscription'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'
import Dashboard from './Dashboard'

const DashboardRoot = () => {
  useSubscription('DashboardRoot', NotificationSubscription)
  useSubscription('DashboardRoot', OrganizationSubscription)
  useSubscription('DashboardRoot', TaskSubscription)
  useSubscription('DashboardRoot', TeamSubscription)
  const queryRef = useQueryLoaderNow<DashboardQuery>(dashboardQuery, {first: 5})
  return <Suspense fallback={''}>{queryRef && <Dashboard queryRef={queryRef} />}</Suspense>
}

export default withRouter(DashboardRoot)
