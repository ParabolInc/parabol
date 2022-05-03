import React, {Suspense} from 'react'
import {PreloadedQuery} from 'react-relay'
import useSubscription from '../../../hooks/useSubscription'
import NotificationSubscription from '../../../subscriptions/NotificationSubscription'
import {UserProfileQuery} from '../../../__generated__/UserProfileQuery.graphql'
import UserProfile from './UserProfile'

interface Props {
  prepared: {
    queryRef: PreloadedQuery<UserProfileQuery>
  }
}

const UserProfileRoot = (props: Props) => {
  const {
    prepared: {queryRef}
  } = props
  useSubscription('UserProfileRoot', NotificationSubscription)
  return <Suspense fallback={''}>{queryRef && <UserProfile queryRef={queryRef} />}</Suspense>
}

export default UserProfileRoot
