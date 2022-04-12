import React from 'react'
import {RouteComponentProps} from 'react-router'
import LoadingComponent from '../../../../components/LoadingComponent/LoadingComponent'
import {createRouter, JSResource, RouteRenderer, RoutingContext} from '../../../../routing'
import {LoaderSize} from '../../../../types/constEnums'
import {useTasksRoute} from './useTasksRoute'
import {useTimelineRoute} from './useTimelineRoute'

interface Props extends RouteComponentProps {}

const UserDashMain = (props: Props) => {
  const {match} = props
  const timelineRoute = useTimelineRoute(match)
  const tasksRoute = useTasksRoute(match)

  const router = createRouter([
    {
      component: JSResource('DashContentRoot', () => import('./DashContentRoot')),
      prepare: () => ({}),
      routes: [timelineRoute, tasksRoute]
    }
  ])

  return (
    <RoutingContext.Provider value={router.context}>
      {/* Render the active route */}
      <RouteRenderer fallbackLoader={<LoadingComponent spinnerSize={LoaderSize.PANEL} />} />
    </RoutingContext.Provider>
  )
}

export default UserDashMain
