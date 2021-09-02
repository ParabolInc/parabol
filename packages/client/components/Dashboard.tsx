import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {lazy, useRef} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {matchPath, Route, RouteProps, Switch} from 'react-router'
import useBreakpoint from '~/hooks/useBreakpoint'
import useRouter from '~/hooks/useRouter'
import useSnackNag from '~/hooks/useSnackNag'
import useSnacksForNewMeetings from '~/hooks/useSnacksForNewMeetings'
import {Breakpoint} from '~/types/constEnums'
import useSidebar from '../hooks/useSidebar'
import {DashboardQuery} from '../__generated__/DashboardQuery.graphql'
import DashSidebar from './Dashboard/DashSidebar'
import MobileDashSidebar from './Dashboard/MobileDashSidebar'
import DashTopBar from './DashTopBar'
import MobileDashTopBar from './MobileDashTopBar'
import StartMeetingFAB from './StartMeetingFAB'
import StaticStartMeetingFAB from './StaticStartMeetingFAB'
import SwipeableDashSidebar from './SwipeableDashSidebar'

const MeetingsDash = lazy(() =>
  import(/* webpackChunkName: 'MeetingsDash' */ '../components/MeetingsDash')
)
const UserDashboard = lazy(() =>
  import(
    /* webpackChunkName: 'UserDashboard' */ '../modules/userDashboard/components/UserDashboard/UserDashboard'
  )
)
const TeamRoot = lazy(() =>
  import(/* webpackChunkName: 'TeamRoot' */ '../modules/teamDashboard/components/TeamRoot')
)
const NewTeam = lazy(() =>
  import(
    /* webpackChunkName: 'NewTeamRoot' */ '../modules/newTeam/containers/NewTeamForm/NewTeamRoot'
  )
)

const getShowFAB = (location: NonNullable<RouteProps['location']>) => {
  const {pathname} = location
  return (
    pathname.includes('/me/tasks') ||
    !!matchPath(pathname, {
      path: '/me',
      exact: true,
      strict: false
    }) ||
    !!matchPath(pathname, {
      path: '/meetings',
      exact: true,
      strict: false
    }) ||
    !!matchPath(pathname, {
      path: '/team/:teamId',
      exact: true,
      strict: false
    })
  )
}

interface Props {
  queryRef: PreloadedQuery<DashboardQuery>
}

const DashLayout = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
  // overflow: 'auto', removed because react-beautiful-dnd only supports 1 scrolling parent
})

const DashPanel = styled('div')({
  display: 'flex',
  flex: 1,
  height: '100%',
  overflow: 'hidden'
})

const DashMain = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  minHeight: 0,
  overflow: 'auto',
  position: 'relative'
})

const Dashboard = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<DashboardQuery>(
    graphql`
      query DashboardQuery($first: Int!, $after: DateTime) {
        viewer {
          ...MeetingsDash_viewer
          ...MobileDashSidebar_viewer
          ...MobileDashTopBar_viewer
          ...DashTopBar_viewer
          ...DashSidebar_viewer
          overLimitCopy
          teams {
            activeMeetings {
              ...useSnacksForNewMeetings_meetings
            }
          }
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )
  const {viewer} = data
  const {teams} = viewer
  const activeMeetings = teams.flatMap((team) => team.activeMeetings).filter(Boolean)
  const {isOpen, toggle, handleMenuClick} = useSidebar()
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const {location} = useRouter()
  const overLimitCopy = viewer?.overLimitCopy
  const meetingsDashRef = useRef<HTMLDivElement>(null)
  useSnackNag(overLimitCopy)
  useSnacksForNewMeetings(activeMeetings)
  return (
    <DashLayout>
      {isDesktop ? (
        <DashTopBar viewer={viewer} toggle={toggle} />
      ) : (
        <MobileDashTopBar viewer={viewer} toggle={toggle} />
      )}
      <DashPanel>
        {isDesktop ? (
          <DashSidebar viewer={viewer} isOpen={isOpen} />
        ) : (
          <SwipeableDashSidebar isOpen={isOpen} onToggle={toggle}>
            <MobileDashSidebar viewer={viewer} handleMenuClick={handleMenuClick} />
          </SwipeableDashSidebar>
        )}
        <DashMain ref={meetingsDashRef}>
          <Switch>
            <Route
              path='/meetings'
              render={(routeProps) => (
                <MeetingsDash {...routeProps} meetingsDashRef={meetingsDashRef} viewer={viewer} />
              )}
            />
            <Route path='/me' component={UserDashboard} />
            <Route path='/team/:teamId' component={TeamRoot} />
            <Route path='/newteam/:defaultOrgId?' component={NewTeam} />
          </Switch>
        </DashMain>
      </DashPanel>
      {getShowFAB(location) ? isDesktop ? <StaticStartMeetingFAB /> : <StartMeetingFAB /> : null}
    </DashLayout>
  )
}

export default Dashboard
