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
  const queryRef = useQueryLoaderNow<DashboardQuery>(dashboardQuery, {
    first: 5,
    // relay-compiler has a bug where null literal values are stripped away. However, null != undefined.
    // The only workaround is to pass null as a variable instead of a literal
    // Issue here: https://github.com/facebook/relay/issues/4488
    nullId: null
  })
  return <Suspense fallback={''}>{queryRef && <Dashboard queryRef={queryRef} />}</Suspense>
}

export default withRouter(DashboardRoot)
