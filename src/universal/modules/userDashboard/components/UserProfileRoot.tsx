import React from 'react'
import {graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {Dispatch} from 'redux'
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent'
import LoadingView from 'universal/components/LoadingView/LoadingView'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import NotificationSubscription from 'universal/subscriptions/NotificationSubscription'
import {cacheConfig} from 'universal/utils/constants'
import {connect} from 'react-redux'
import UserProfile from './UserProfile'

const query = graphql`
  query UserProfileRootQuery {
    viewer {
      ...UserProfile_viewer
    }
  }
`

const subscriptions = [NotificationSubscription]

interface Props extends WithAtmosphereProps, RouteComponentProps<{teamId: string}> {
  atmosphere: Object
  dispatch: Dispatch<any>
}

const UserProfileRoot = (props: Props) => {
  const {
    atmosphere,
    dispatch,
    history,
    location,
    match: {
      params: {teamId}
    }
  } = props
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      subscriptions={subscriptions}
      subParams={{dispatch, history, location}}
      render={(readyState) => (
        <RelayTransitionGroup
          readyState={readyState}
          error={<ErrorComponent height={'14rem'} />}
          loading={<LoadingView minHeight='50vh' />}
          // @ts-ignore
          ready={<UserProfile />}
        />
      )}
    />
  )
}

export default (connect() as any)(withRouter(withAtmosphere(UserProfileRoot)))
