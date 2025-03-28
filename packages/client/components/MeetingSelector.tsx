import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Redirect} from 'react-router'
import useAtmosphere from '~/hooks/useAtmosphere'
import SetAppLocationMutation from '~/mutations/SetAppLocationMutation'
import {MeetingSelectorQuery} from '../__generated__/MeetingSelectorQuery.graphql'
import useSubscription from '../hooks/useSubscription'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'
import lazyPreload from '../utils/lazyPreload'

interface Props {
  meetingId: string
  queryRef: PreloadedQuery<MeetingSelectorQuery>
}

const meetingLookup = {
  action: lazyPreload(() => import(/* webpackChunkName: 'ActionMeeting' */ './ActionMeeting')),
  poker: lazyPreload(() => import(/* webpackChunkName: 'PokerMeeting' */ './PokerMeeting')),
  retrospective: lazyPreload(() => import(/* webpackChunkName: 'RetroMeeting' */ './RetroMeeting')),
  teamPrompt: lazyPreload(
    () => import(/* webpackChunkName: 'TeamPromptMeeting' */ './TeamPromptMeeting')
  )
}

const MeetingSelector = (props: Props) => {
  const {meetingId, queryRef} = props

  const atmosphere = useAtmosphere()
  const data = usePreloadedQuery<MeetingSelectorQuery>(
    graphql`
      query MeetingSelectorQuery($meetingId: ID!) {
        viewer {
          isConnected
          canAccessMeeting: canAccess(entity: Meeting, id: $meetingId)
          meeting(meetingId: $meetingId) {
            ...MeetingSelector_meeting @relay(mask: false)
          }
        }
      }
    `,
    queryRef
  )

  const {viewer} = data
  const {isConnected, meeting, canAccessMeeting} = viewer

  useEffect(() => {
    if (!meetingId || !isConnected) return
    const location = `/meet/${meetingId}`
    const setAfterUpgrade = async () => {
      SetAppLocationMutation(atmosphere, {location})
    }
    setAfterUpgrade()
    return () => {
      SetAppLocationMutation(atmosphere, {location: null})
    }
  }, [isConnected])
  useSubscription('MeetingSelector', NotificationSubscription)
  useSubscription('MeetingSelector', OrganizationSubscription)
  useSubscription('MeetingSelector', TaskSubscription)
  useSubscription('MeetingSelector', TeamSubscription)

  if (!canAccessMeeting && !meeting) {
    return (
      <Redirect
        to={{
          pathname: `/invitation-required`,
          search: `?redirectTo=${encodeURIComponent(
            window.location.pathname
          )}&meetingId=${meetingId}`
        }}
      />
    )
  } else if (!meeting) {
    // We know that a null meeting while we should have access is an error.
    // We could render here an error component here. For that we'd need to create an error, store it in state, log it to Sentry and render the component.
    // This is pretty much what the ErrorBoundary will do if we just throw here.
    throw new Error('Meeting was null')
  }

  const {meetingType} = meeting
  const Meeting = meetingLookup[meetingType]
  return <Meeting meeting={meeting as any} />
}

graphql`
  fragment MeetingSelector_meeting on NewMeeting {
    ...RetroMeeting_meeting
    ...ActionMeeting_meeting
    ...PokerMeeting_meeting
    ...TeamPromptMeeting_meeting
    meetingType
  }
`

export default MeetingSelector
