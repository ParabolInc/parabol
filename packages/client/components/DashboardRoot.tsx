import React from 'react'
import {useQueryLoader} from 'react-relay'
import {withRouter} from 'react-router-dom'
import useRouter from '../hooks/useRouter'
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
import teamContainerQuery, {TeamContainerQuery} from '../__generated__/TeamContainerQuery.graphql'
import userProfileQuery, {UserProfileQuery} from '../__generated__/UserProfileQuery.graphql'
import LoadingComponent from './LoadingComponent/LoadingComponent'

const DashboardRoot = () => {
  useSubscription('DashboardRoot', NotificationSubscription)
  useSubscription('DashboardRoot', OrganizationSubscription)
  useSubscription('DashboardRoot', TaskSubscription)
  useSubscription('DashboardRoot', TeamSubscription)

  // todo: migrate to EntryPoint pattern: https://relay.dev/docs/glossary/#entrypoint
  const timelineRoute = useTimelineRoute('/me')
  const tasksRoute = useTasksRoute('/me/tasks')

  const [dashboardQueryRef, loadDashboardQuery] = useQueryLoader<DashboardQuery>(dashboardQuery)
  const [userProfileQueryRef, loadUserProfileQuery] =
    useQueryLoader<UserProfileQuery>(userProfileQuery)
  const [teamQueryRef, loadTeamQueryRef] = useQueryLoader<TeamContainerQuery>(teamContainerQuery)

  const {match} = useRouter()
  const {teamId} = match.params

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
          <Route path={`${match.url}/profile`} component={UserProfileRoot} />
          <Route exact path={`${match.url}/organizations`} component={OrganizationsRoot} />
          <Route path={`${match.url}/organizations/:orgId`} component={OrganizationRoot} />
        * */
        {
          path: '/me/profile',
          exact: true,
          component: JSResource(
            'UserProfileRoot',
            () => import('../modules/userDashboard/components/UserProfileRoot')
          ),
          prepare: () => {
            if (!userProfileQueryRef) {
              loadUserProfileQuery({teamId})
            }

            return {queryRef: userProfileQueryRef}
          }
        },
        {
          path: '/team/:teamId',
          exact: true,
          component: JSResource(
            'TeamRoot',
            () => import('../modules/teamDashboard/components/TeamRoot')
          ),
          prepare: (params) => {
            const teamId = params.teamId!
            console.log('========teamId========', {teamId, teamQueryRef})
            if (!teamQueryRef) {
              loadTeamQueryRef({teamId})
            }

            return {queryRef: teamQueryRef}
          },
          routes: []
        },
        {
          path: '/newteam/:defaultOrgId?',
          exact: true,
          component: JSResource(
            'NewTeamRoot',
            () => import('../modules/newTeam/containers/NewTeamForm/NewTeamRoot')
          ),
          prepare: () => ({}),
          routes: []
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
