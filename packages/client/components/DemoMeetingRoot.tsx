import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useLazyLoadQuery} from 'react-relay'
import MeetingSubscription from '~/subscriptions/MeetingSubscription'
import useSubscription from '../hooks/useSubscription'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'
import {RetroDemo} from '../types/constEnums'
import {DemoMeetingRootQuery} from '../__generated__/DemoMeetingRootQuery.graphql'
import RetroMeeting from './RetroMeeting'

const query = graphql`
  query DemoMeetingRootQuery($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        ...RetroMeeting_meeting
      }
    }
  }
`

const DemoMeetingRoot = () => {
  useSubscription('DemoMeetingRoot', NotificationSubscription)
  useSubscription('DemoMeetingRoot', OrganizationSubscription)
  useSubscription('DemoMeetingRoot', TaskSubscription)
  useSubscription('DemoMeetingRoot', TeamSubscription)
  useSubscription('DemoMeetingRoot', MeetingSubscription, {meetingId: RetroDemo.MEETING_ID})
  const data = useLazyLoadQuery<DemoMeetingRootQuery>(query, {
    meetingId: RetroDemo.MEETING_ID
  })
  if (!data?.viewer?.meeting) return null
  return <RetroMeeting meeting={data.viewer.meeting} />
}
export default DemoMeetingRoot
