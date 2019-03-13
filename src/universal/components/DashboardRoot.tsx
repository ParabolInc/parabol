import React from 'react'
import {graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
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
  TeamMemberSubscription,
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
