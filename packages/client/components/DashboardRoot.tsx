import React, {Suspense} from 'react'
import {withRouter} from 'react-router-dom'
import useAtmosphere from '../hooks/useAtmosphere'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import useSubscription from '../hooks/useSubscription'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'
import {useUserTaskFilters} from '../utils/useUserTaskFilters'
import dashboardQuery, {DashboardQuery} from '../__generated__/DashboardQuery.graphql'
import Dashboard from './Dashboard'

const DashboardRoot = () => {
  useSubscription('DashboardRoot', NotificationSubscription)
  useSubscription('DashboardRoot', OrganizationSubscription)
  useSubscription('DashboardRoot', TaskSubscription)
  useSubscription('DashboardRoot', TeamSubscription)
  const atmosphere = useAtmosphere()
  const {teamIds} = useUserTaskFilters(atmosphere.viewerId)
  const queryRef = useQueryLoaderNow<DashboardQuery>(dashboardQuery, {first: 5, teamIds})
  return <Suspense fallback={''}>{queryRef && <Dashboard queryRef={queryRef} />}</Suspense>
}

export default withRouter(DashboardRoot)
