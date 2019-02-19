import React, {lazy} from 'react'
import {DragDropContext as dragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import {graphql} from 'react-relay'
import {Route} from 'react-router'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import DashLayout from 'universal/components/Dashboard/DashLayout'
import DashSidebar from 'universal/components/Dashboard/DashSidebar'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import NewAuthTokenSubscription from 'universal/subscriptions/NewAuthTokenSubscription'
import NotificationSubscription from 'universal/subscriptions/NotificationSubscription'
import OrganizationSubscription from 'universal/subscriptions/OrganizationSubscription'
import TaskSubscription from 'universal/subscriptions/TaskSubscription'
import TeamMemberSubscription from 'universal/subscriptions/TeamMemberSubscription'
import TeamSubscription from 'universal/subscriptions/TeamSubscription'
import {cacheConfig} from 'universal/utils/constants'

const query = graphql`
  query DashboardWrapperQuery {
    viewer {
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
      ...DashLayout_viewer
    }
  }
`

const UserDashboard = lazy(() =>
  import(/* webpackChunkName: 'UserDashboard' */ 'universal/modules/userDashboard/components/UserDashboard/UserDashboard')
)
const TeamRoot = lazy(() =>
  import(/* webpackChunkName: 'TeamRoot' */ 'universal/modules/teamDashboard/components/TeamRoot')
)
const NewTeam = lazy(() =>
  import(/* webpackChunkName: 'NewTeamRoot' */ 'universal/modules/newTeam/containers/NewTeamForm/NewTeamRoot')
)

const subscriptions = [
  NewAuthTokenSubscription,
  NotificationSubscription,
  TaskSubscription,
  TeamSubscription,
  TeamMemberSubscription,
  OrganizationSubscription
]

interface Props extends WithAtmosphereProps, RouteComponentProps<{}> {}

const DashboardRoot = ({atmosphere, history, location}: Props) => {
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{}}
      subParams={{history, location}}
      subscriptions={subscriptions}
      render={({props: renderProps}) => {
        const notifications =
          renderProps && renderProps.viewer ? renderProps.viewer.notifications : undefined
        const viewer = renderProps ? renderProps.viewer : null
        return (
          <DashLayout viewer={viewer}>
            <DashSidebar viewer={viewer} location={location} />
            <Route path='/me' component={UserDashboard} notifications={notifications} />
            <Route path='/team/:teamId' component={TeamRoot} />
            <Route path='/newteam/:defaultOrgId?' component={NewTeam} />
          </DashLayout>
        )
      }}
    />
  )
}

export default dragDropContext(HTML5Backend)(withRouter(withAtmosphere(DashboardRoot)))
