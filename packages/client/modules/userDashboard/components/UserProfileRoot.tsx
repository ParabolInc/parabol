import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {QueryRenderer} from 'react-relay'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import NotificationSubscription from '../../../subscriptions/NotificationSubscription'
import {cacheConfig} from '../../../utils/constants'
import {LoaderSize} from '../../../types/constEnums'
import renderQuery from '../../../utils/relay/renderQuery'
import UserProfile from './UserProfile'
import useSubscription from '../../../hooks/useSubscription'
import OrganizationSubscription from '../../../subscriptions/OrganizationSubscription'
import TaskSubscription from '../../../subscriptions/TaskSubscription'
import TeamSubscription from '../../../subscriptions/TeamSubscription'

const query = graphql`
  query UserProfileRootQuery {
    viewer {
      ...UserProfile_viewer
    }
  }
`

interface Props extends WithAtmosphereProps, RouteComponentProps<{teamId: string}> {}

const UserProfileRoot = (props: Props) => {
  const {
    atmosphere,
    history,
    location,
    match: {
      params: {teamId}
    }
  } = props
  useSubscription(UserProfileRoot.name, NotificationSubscription)
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      render={renderQuery(UserProfile, {size: LoaderSize.PANEL})}
    />
  )
}

export default withRouter(withAtmosphere(UserProfileRoot))
