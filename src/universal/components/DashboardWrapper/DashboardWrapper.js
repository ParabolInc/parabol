import PropTypes from 'prop-types'
import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import DashSidebar from 'universal/components/Dashboard/DashSidebar'
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import OrganizationSubscription from 'universal/subscriptions/OrganizationSubscription'
import TaskSubscription from 'universal/subscriptions/TaskSubscription'
import TeamMemberSubscription from 'universal/subscriptions/TeamMemberSubscription'
import TeamSubscription from 'universal/subscriptions/TeamSubscription'
import {cacheConfig} from 'universal/utils/constants'
import NewAuthTokenSubscription from 'universal/subscriptions/NewAuthTokenSubscription'
import NotificationSubscription from 'universal/subscriptions/NotificationSubscription'
import HTML5Backend from '@mattkrick/react-dnd-html5-backend'
import {DragDropContext as dragDropContext} from '@mattkrick/react-dnd'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import DashLayout from 'universal/components/Dashboard/DashLayout'

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

const userDashboard = () =>
  import(/* webpackChunkName: 'UserDashboard' */ 'universal/modules/userDashboard/components/UserDashboard/UserDashboard')
const teamRoot = () =>
  import(/* webpackChunkName: 'TeamRoot' */ 'universal/modules/teamDashboard/components/TeamRoot')
const newTeam = () =>
  import(/* webpackChunkName: 'NewTeamRoot' */ 'universal/modules/newTeam/containers/NewTeamForm/NewTeamRoot')

const subscriptions = [
  NewAuthTokenSubscription,
  NotificationSubscription,
  TaskSubscription,
  TeamSubscription,
  TeamMemberSubscription,
  OrganizationSubscription
]

const DashboardWrapper = ({atmosphere, dispatch, history, location}) => {
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{}}
      subParams={{dispatch, history, location}}
      subscriptions={subscriptions}
      render={({props: renderProps}) => {
        const notifications =
          renderProps && renderProps.viewer ? renderProps.viewer.notifications : undefined
        const viewer = renderProps ? renderProps.viewer : null
        return (
          <DashLayout viewer={viewer}>
            <DashSidebar viewer={viewer} location={location} />
            <AsyncRoute path='/me' mod={userDashboard} extraProps={{notifications}} />
            <AsyncRoute path='/team/:teamId' mod={teamRoot} />
            <AsyncRoute path='/newteam/:defaultOrgId?' mod={newTeam} />
          </DashLayout>
        )
      }}
    />
  )
}

DashboardWrapper.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  notifications: PropTypes.object
}

export default dragDropContext(HTML5Backend)(
  connect()(withRouter(withAtmosphere(DashboardWrapper)))
)
