import {Suspense} from 'react'
import {useParams} from 'react-router-dom'
import userProfileQuery, {
  type UserProfileQuery
} from '../../../__generated__/UserProfileQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import useSubscription from '../../../hooks/useSubscription'
import NotificationSubscription from '../../../subscriptions/NotificationSubscription'
import UserProfile from './UserProfile'

const UserProfileRoot = () => {
  const {teamId} = useParams()
  useSubscription('UserProfileRoot', NotificationSubscription)
  const queryRef = useQueryLoaderNow<UserProfileQuery>(userProfileQuery, {})
  return (
    <Suspense fallback={''}>
      {queryRef && <UserProfile queryRef={queryRef} teamId={teamId!} />}
    </Suspense>
  )
}

export default UserProfileRoot
