import graphql from 'babel-plugin-relay/macro'
import {useLazyLoadQuery} from 'react-relay'
import MeetingSubscription from '~/subscriptions/MeetingSubscription'
import type {DemoMeetingRootQuery} from '../__generated__/DemoMeetingRootQuery.graphql'
import useSubscription from '../hooks/useSubscription'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'
import {RetroDemo} from '../types/constEnums'
import RetroMeeting from './RetroMeeting'

const query = graphql`
  query DemoMeetingRootQuery($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        ...RetroMeeting_meeting @alias
      }
    }
  }
`

const DemoMeetingRoot = () => {
  useSubscription('DemoMeetingRoot', NotificationSubscription)
  useSubscription('DemoMeetingRoot', OrganizationSubscription)
  useSubscription('DemoMeetingRoot', TaskSubscription)
  useSubscription('DemoMeetingRoot', TeamSubscription)
  useSubscription('DemoMeetingRoot', MeetingSubscription, {
    meetingId: RetroDemo.MEETING_ID
  })
  const data = useLazyLoadQuery<DemoMeetingRootQuery>(query, {
    meetingId: RetroDemo.MEETING_ID
  })
  const meeting = data?.viewer?.meeting?.RetroMeeting_meeting
  if (!meeting) return null
  return <RetroMeeting meeting={meeting} />
}
export default DemoMeetingRoot
