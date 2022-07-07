import React, {Suspense, useCallback, useEffect} from 'react'
import {useHistory, useLocation} from 'react-router'
import newMeetingQuery, {NewMeetingQuery} from '~/__generated__/NewMeetingQuery.graphql'
import useModal from '../hooks/useModal'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import useRouter from '../hooks/useRouter'
import useSubscription from '../hooks/useSubscription'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'
import {renderLoader} from '../utils/relay/renderLoader'
import NewMeeting from './NewMeeting'

const NewMeetingRoot = () => {
  const {match} = useRouter<{teamId: string}>()
  const {params} = match
  const {teamId} = params
  useSubscription('NewMeetingRoot', NotificationSubscription)
  useSubscription('NewMeetingRoot', OrganizationSubscription)
  useSubscription('NewMeetingRoot', TaskSubscription)
  useSubscription('NewMeetingRoot', TeamSubscription)
  const queryRef = useQueryLoaderNow<NewMeetingQuery>(newMeetingQuery, {teamId})

  const location = useLocation<{backgroundLocation?: Location}>()
  const history = useHistory()

  const onClose = useCallback(() => {
    const state = location.state
    history.push(state?.backgroundLocation ?? '/meetings')
  }, [location])

  const {openPortal, closePortal, modalPortal} = useModal({onClose})

  useEffect(() => {
    openPortal()
    return () => {
      closePortal()
    }
  }, [])

  return modalPortal(
    <Suspense fallback={renderLoader()}>
      {queryRef && <NewMeeting teamId={teamId} queryRef={queryRef} onClose={closePortal} />}
    </Suspense>
  )
}

export default NewMeetingRoot
