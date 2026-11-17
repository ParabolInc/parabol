import {Suspense} from 'react'
import {useParams} from 'react-router'
import userProfileQuery, {
  type UserProfileQuery
} from '../../../__generated__/UserProfileQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import UserProfile from './UserProfile'

const UserProfileRoot = () => {
  const {teamId} = useParams()
  const queryRef = useQueryLoaderNow<UserProfileQuery>(userProfileQuery, {})
  return (
    <Suspense fallback={''}>
      {queryRef && <UserProfile queryRef={queryRef} teamId={teamId!} />}
    </Suspense>
  )
}

export default UserProfileRoot
