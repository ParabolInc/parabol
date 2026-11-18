import {useParams} from '@tanstack/react-router'
import {Suspense} from 'react'
import userProfileQuery, {
  type UserProfileQuery
} from '../../../__generated__/UserProfileQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import UserProfile from './UserProfile'

const UserProfileRoot = () => {
  const {teamId} = useParams({strict: false})
  const queryRef = useQueryLoaderNow<UserProfileQuery>(userProfileQuery, {})
  return (
    <Suspense fallback={''}>
      {queryRef && <UserProfile queryRef={queryRef} teamId={teamId!} />}
    </Suspense>
  )
}

export default UserProfileRoot
