import {Dashboard_viewer} from '__generated__/Dashboard_viewer.graphql'
import React, {lazy} from 'react'
import {DragDropContext as dragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {Route, Switch} from 'react-router'
import DashSidebar from './Dashboard/DashSidebar'
import MeetingDashAlert from './MeetingDashAlert'

const UserDashboard = lazy(() =>
  import(/* webpackChunkName: 'UserDashboard' */ 'universal/modules/userDashboard/components/UserDashboard/UserDashboard')
)
const TeamRoot = lazy(() =>
  import(/* webpackChunkName: 'TeamRoot' */ 'universal/modules/teamDashboard/components/TeamRoot')
)
const NewTeam = lazy(() =>
  import(/* webpackChunkName: 'NewTeamRoot' */ 'universal/modules/newTeam/containers/NewTeamForm/NewTeamRoot')
)

interface Props {
  viewer: Dashboard_viewer | null
}

const DashLayout = styled('div')({
  display: 'flex'
})

const DashPanel = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1
})

const Dashboard = (props: Props) => {
  const {viewer} = props
  return (
    <DashLayout>
      <DashSidebar viewer={viewer} location={location} />
      <DashPanel>
        <MeetingDashAlert viewer={viewer} />
        <Switch>
          <Route
            path='/me'
            render={(p) => (
              <UserDashboard {...p} notifications={viewer ? viewer.notifications : []} />
            )}
          />
          <Route path='/team/:teamId' component={TeamRoot} />
          <Route path='/newteam/:defaultOrgId?' component={NewTeam} />
        </Switch>
      </DashPanel>
    </DashLayout>
  )
}

export default createFragmentContainer(
  dragDropContext(HTML5Backend)(Dashboard),
  graphql`
    fragment Dashboard_viewer on User {
      ...MeetingDashAlert_viewer
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
)
