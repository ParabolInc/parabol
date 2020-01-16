import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import useBreakpoint from 'hooks/useBreakpoint'
import React, {lazy} from 'react'
import {createFragmentContainer} from 'react-relay'
import {Route, Switch} from 'react-router'
import {Breakpoint} from 'types/constEnums'
import useSidebar from '../hooks/useSidebar'
import {Dashboard_viewer} from '../__generated__/Dashboard_viewer.graphql'
import DashSidebar from './Dashboard/DashSidebar'
import MobileDashSidebar from './Dashboard/MobileDashSidebar'
import DashTopBar from './DashTopBar'
import MobileDashTopBar from './MobileDashTopBar'
import SwipeableDashSidebar from './SwipeableDashSidebar'
import StartMeetingFAB from './StartMeetingFAB'

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

interface Props {
  viewer: Dashboard_viewer | null
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
  const {viewer} = props
  const {isOpen, toggle, handleMenuClick} = useSidebar()
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
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
        <DashMain>
          <Switch>
            <Route
              path='/me'
              render={(p) => (
                <UserDashboard {...p} notifications={viewer ? viewer.notifications : null} />
              )}
            />
            <Route path='/team/:teamId' component={TeamRoot} />
            <Route path='/newteam/:defaultOrgId?' component={NewTeam} />
          </Switch>
        </DashMain>
      </DashPanel>
      <StartMeetingFAB />
    </DashLayout>
  )
}

export default createFragmentContainer(Dashboard, {
  viewer: graphql`
    fragment Dashboard_viewer on User {
      ...MobileDashSidebar_viewer
      ...MobileDashTopBar_viewer
      ...DashAlert_viewer
      ...DashTopBar_viewer
      notifications(first: 100) @connection(key: "DashboardWrapper_notifications") {
        edges {
          node {
            id
            orgId
            startAt
            type
            ...NotificationRow_notification
          }
        }
      }
      ...DashSidebar_viewer
    }
  `
})
