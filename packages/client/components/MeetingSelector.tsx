import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
import useStoreQueryRetry from '~/hooks/useStoreQueryRetry'
import {MeetingSelector_viewer} from '~/__generated__/MeetingSelector_viewer.graphql'
import useRouter from '../hooks/useRouter'
import useSubscription from '../hooks/useSubscription'
import MeetingSubscription from '../subscriptions/MeetingSubscription'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'
import {MeetingTypeEnum} from '../types/graphql'
import lazyPreload from '../utils/lazyPreload'

interface Props {
  meetingId: string
  viewer: MeetingSelector_viewer
  retry(): void
}

const meetingLookup = {
  [MeetingTypeEnum.action]: lazyPreload(() =>
    import(/* webpackChunkName: 'ActionMeeting' */ './ActionMeeting')
  ),
  [MeetingTypeEnum.retrospective]: lazyPreload(() =>
    import(/* webpackChunkName: 'RetroMeeting' */ './RetroMeeting')
  )
}

const MeetingSelector = (props: Props) => {
  const {meetingId, viewer, retry} = props
  const {meeting} = viewer
  const {history} = useRouter()
  useEffect(() => {
    if (!meeting) {
      history.replace({
        pathname: `/invitation-required`,
        search: `?redirectTo=${encodeURIComponent(window.location.pathname)}&meetingId=${meetingId}`
      })
    }
  }, [])
  useStoreQueryRetry(retry)
  useSubscription('MeetingSelector', NotificationSubscription)
  useSubscription('MeetingSelector', OrganizationSubscription)
  useSubscription('MeetingSelector', TaskSubscription)
  useSubscription('MeetingSelector', TeamSubscription)
  useSubscription('MeetingSelector', MeetingSubscription, {meetingId})
  if (!meeting) return null
  const {meetingType} = meeting
  const Meeting = meetingLookup[meetingType]
  return <Meeting meeting={meeting} />
}

graphql`
  fragment MeetingSelector_meeting on NewMeeting {
    ...RetroMeeting_meeting
    ...ActionMeeting_meeting
    meetingType
  }
`

export default createFragmentContainer(MeetingSelector, {
  viewer: graphql`
    fragment MeetingSelector_viewer on User {
      meeting(meetingId: $meetingId) {
        ...MeetingSelector_meeting @relay(mask: false)
      }
    }
  `
})
