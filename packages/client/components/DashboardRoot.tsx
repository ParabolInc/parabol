import React from 'react'
import {useQueryLoader} from 'react-relay'
import {withRouter} from 'react-router-dom'
import useSubscription from '../hooks/useSubscription'
import {useTasksRoute} from '../hooks/useTasksRoute'
import {useTimelineRoute} from '../hooks/useTimelineRoute'
import {JSResource, RouteRenderer, RoutingContext, useCreateRouter} from '../routing'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'
import {LoaderSize} from '../types/constEnums'
import dashboardQuery, {DashboardQuery} from '../__generated__/DashboardQuery.graphql'
import LoadingComponent from './LoadingComponent/LoadingComponent'

const DashboardRoot = () => {
  useSubscription('DashboardRoot', NotificationSubscription)
  useSubscription('DashboardRoot', OrganizationSubscription)
  useSubscription('DashboardRoot', TaskSubscription)
  useSubscription('DashboardRoot', TeamSubscription)

  // todo: migrate to EntryPoint pattern: https://relay.dev/docs/glossary/#entrypoint
  const timelineRoute = useTimelineRoute('/me')
  const tasksRoute = useTasksRoute(`/me/tasks`)

  const [dashboardQueryRef, loadDashboardQuery] = useQueryLoader<DashboardQuery>(dashboardQuery)
  const router = useCreateRouter([
    {
      component: JSResource('Dashboard', () => import('./Dashboard')),
      prepare: () => {
        if (!dashboardQueryRef) {
          loadDashboardQuery({first: 5})
        }

        return {queryRef: dashboardQueryRef}
      },
      routes: [
        {
          path: '/meetings',
          exact: true,
          component: JSResource(
            'MeetingsDash',
            // TODO: add dash ref back
            () => import('../components/MeetingsDash')
          ),
          prepare: () => ({}),
          // TODO: add children routes
          routes: []
        },
        {
          path: '/me',
          exact: true,
          component: JSResource(
            'UserDashMain',
            () => import('../modules/userDashboard/components/UserDashMain/UserDashMain')
          ),
          prepare: () => ({}),
          routes: [timelineRoute, tasksRoute]
        },
        // TODO: add more children routes
        /*
          <Route path={`${match.url}/profile`} component={UserProfile} />
          <Route exact path={`${match.url}/organizations`} component={Organizations} />
          <Route path={`${match.url}/organizations/:orgId`} component={Organization} />
        * */
        {
          path: '/me/profile',
          exact: true,
          component: JSResource(
            'UserProfile',
            () => import('../modules/userDashboard/components/UserProfile')
          ),
          prepare: () => ({})
        },
        {
          path: '/team/:teamId',
          exact: true,
          component: JSResource(
            'TeamRoot',
            () => import('../modules/teamDashboard/components/TeamRoot')
          ),
          prepare: () => ({}),
          routes: [timelineRoute, tasksRoute]
        },
        {
          path: '/newteam/:defaultOrgId?',
          exact: true,
          component: JSResource(
            'NewTeamRoot',
            () => import('../modules/newTeam/containers/NewTeamForm/NewTeamRoot')
          ),
          prepare: () => ({}),
          routes: [timelineRoute, tasksRoute]
        }
      ]
    }
  ])

  return (
    <RoutingContext.Provider value={router.context}>
      {/* Render the active route */}
      <RouteRenderer fallbackLoader={<LoadingComponent spinnerSize={LoaderSize.PANEL} />} />
    </RoutingContext.Provider>
  )
}

export default withRouter(DashboardRoot)
