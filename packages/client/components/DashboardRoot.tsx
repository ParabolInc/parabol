import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {QueryRenderer} from 'react-relay'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'
import Dashboard from './Dashboard'
import useSubscription from '../hooks/useSubscription'

const query = graphql`
  query DashboardRootQuery($first: Int!, $after: DateTime) {
    viewer {
      ...Dashboard_viewer
    }
  }
`

interface Props extends WithAtmosphereProps, RouteComponentProps<{}> {}

const DashboardRoot = ({atmosphere}: Props) => {
  useSubscription(DashboardRoot.name, NotificationSubscription)
  useSubscription(DashboardRoot.name, OrganizationSubscription)
  useSubscription(DashboardRoot.name, TaskSubscription)
  useSubscription(DashboardRoot.name, TeamSubscription)
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{first: 5}}
      fetchPolicy={'store-or-network' as any}
      render={({props}) => {
        return <Dashboard viewer={props ? (props as any).viewer : null} />
      }}
    />
  )
}

export default withRouter(withAtmosphere(DashboardRoot))
