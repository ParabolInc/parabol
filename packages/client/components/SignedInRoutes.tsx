import {Outlet} from '@tanstack/react-router'
import useAppSubscriptions from '../hooks/useAppSubscriptions'
import useAuthRoute from '../hooks/useAuthRoute'
import useNoIndex from '../hooks/useNoIndex'
import MaskedReviewRequestToJoinOrg from './MaskedReviewRequestToJoinOrg'

const SignedInRoutes = () => {
  const isSignedIn = useAuthRoute()
  useAppSubscriptions()
  useNoIndex()
  // children's effects run before this redirect, so they'd send requests without a usable token
  if (!isSignedIn) return null
  return (
    <>
      <Outlet />
      <MaskedReviewRequestToJoinOrg />
    </>
  )
}

export default SignedInRoutes
