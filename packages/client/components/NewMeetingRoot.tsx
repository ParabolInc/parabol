import React, {Suspense} from 'react'
import useRouter from '../hooks/useRouter'
import useSubscription from '../hooks/useSubscription'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'
import NewMeeting from './NewMeeting'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import newMeetingQuery, {NewMeetingQuery} from '~/__generated__/NewMeetingQuery.graphql'

const NewMeetingRoot = () => {
  const {match} = useRouter<{teamId: string}>()
  const {params} = match
  const {teamId} = params
  useSubscription('NewMeetingRoot', NotificationSubscription)
  useSubscription('NewMeetingRoot', OrganizationSubscription)
  useSubscription('NewMeetingRoot', TaskSubscription)
  useSubscription('NewMeetingRoot', TeamSubscription)
  const queryRef = useQueryLoaderNow<NewMeetingQuery>(newMeetingQuery, {teamId})
  return (
    <Suspense fallback={''}>
      {queryRef && <NewMeeting teamId={teamId} queryRef={queryRef} />}
    </Suspense>
  )
}

export default NewMeetingRoot
