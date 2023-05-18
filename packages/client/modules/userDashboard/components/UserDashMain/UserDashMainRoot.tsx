import React, {Suspense} from 'react'
import useQueryLoaderNow from '~/hooks/useQueryLoaderNow'
import userDashMainQuery, {UserDashMainQuery} from '~/__generated__/UserDashMainQuery.graphql'
import UserDashMain from './UserDashMain'
import {RouteComponentProps} from 'react-router'

const UserDashMainRoot = (props: RouteComponentProps) => {
  const queryRef = useQueryLoaderNow<UserDashMainQuery>(userDashMainQuery)
  return (
    <Suspense fallback={''}>{queryRef && <UserDashMain queryRef={queryRef} {...props} />}</Suspense>
  )
}

export default UserDashMainRoot
