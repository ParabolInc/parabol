import React, {Suspense} from 'react'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import useSubscription from '../../../hooks/useSubscription'
import NotificationSubscription from '../../../subscriptions/NotificationSubscription'
import userProfileQuery, {UserProfileQuery} from '../../../__generated__/UserProfileQuery.graphql'
import UserProfile from './UserProfile'

interface Props extends WithAtmosphereProps, RouteComponentProps<{teamId: string}> {}

const UserProfileRoot = (props: Props) => {
  const {
    match: {
      params: {teamId}
    }
  } = props
  useSubscription('UserProfileRoot', NotificationSubscription)
  const queryRef = useQueryLoaderNow<UserProfileQuery>(userProfileQuery, {teamId})
  return (
    <Suspense fallback={''}>
      {queryRef && <UserProfile queryRef={queryRef} teamId={teamId} />}
    </Suspense>
  )
}

export default withRouter(withAtmosphere(UserProfileRoot))
