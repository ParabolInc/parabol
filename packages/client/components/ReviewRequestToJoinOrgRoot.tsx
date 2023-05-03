import React, {Suspense, useCallback, useEffect} from 'react'
import {useHistory, useLocation} from 'react-router'
import useRouter from '../hooks/useRouter'
import useSubscription from '../hooks/useSubscription'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'
import useModal from '../hooks/useModal'
import ReviewRequestToJoinOrgModal from '~/components/ReviewRequestToJoinOrgModal'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import reviewRequestToJoinOrgModalQuery, {
  ReviewRequestToJoinOrgModalQuery
} from '../__generated__/ReviewRequestToJoinOrgModalQuery.graphql'

const ReviewRequestToJoinOrgRoot = () => {
  const {match} = useRouter<{requestId: string}>()
  const {params} = match
  const {requestId} = params
  useSubscription('NewMeetingRoot', NotificationSubscription)
  useSubscription('NewMeetingRoot', OrganizationSubscription)
  useSubscription('NewMeetingRoot', TaskSubscription)
  useSubscription('NewMeetingRoot', TeamSubscription)
  const queryRef = useQueryLoaderNow<ReviewRequestToJoinOrgModalQuery>(
    reviewRequestToJoinOrgModalQuery,
    {requestId}
  )

  const location = useLocation<{backgroundLocation?: Location}>()
  const history = useHistory()

  const onClose = useCallback(() => {
    const state = location.state
    history.replace(state?.backgroundLocation ?? '/meetings')
  }, [location])

  const {openPortal, closePortal, modalPortal} = useModal({
    id: 'reviewRequestToJoinOrgModal',
    onClose
  })

  useEffect(() => {
    openPortal()
    return () => {
      closePortal()
    }
  }, [])

  return (
    <Suspense fallback={''}>
      {queryRef &&
        modalPortal(<ReviewRequestToJoinOrgModal closePortal={closePortal} queryRef={queryRef} />)}
    </Suspense>
  )
}

export default ReviewRequestToJoinOrgRoot
