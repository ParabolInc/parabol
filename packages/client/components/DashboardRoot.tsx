import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import QueryRenderer from './QueryRenderer/QueryRenderer'
import withAtmosphere, {
  WithAtmosphereProps
} from '../decorators/withAtmosphere/withAtmosphere'
import NewAuthTokenSubscription from '../subscriptions/NewAuthTokenSubscription'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'
import {cacheConfig} from '../utils/constants'
import Dashboard from './Dashboard'

const query = graphql`
  query DashboardRootQuery {
    viewer {
      ...Dashboard_viewer
    }
  }
`

const subscriptions = [
  NewAuthTokenSubscription,
  NotificationSubscription,
  TaskSubscription,
  TeamSubscription,
  OrganizationSubscription
]

interface Props extends WithAtmosphereProps, RouteComponentProps<{}> {}

const DashboardRoot = ({atmosphere, history}: Props) => {
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{}}
      subParams={{history}}
      subscriptions={subscriptions}
      render={({props}) => {
        return <Dashboard viewer={props ? props.viewer : null} />
      }}
    />
  )
}

export default withRouter(withAtmosphere(DashboardRoot))
