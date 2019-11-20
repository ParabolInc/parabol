import RetroMeeting from './RetroMeeting'
import {QueryRenderer} from 'react-relay'
import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import useAtmosphere from '../hooks/useAtmosphere'
import {RetroDemo} from '../types/constEnums'
import useSubscription from '../hooks/useSubscription'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'

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
  const atmosphere = useAtmosphere()
  useSubscription(DemoMeetingRoot.name, NotificationSubscription)
  useSubscription(DemoMeetingRoot.name, OrganizationSubscription)
  useSubscription(DemoMeetingRoot.name, TaskSubscription)
  useSubscription(DemoMeetingRoot.name, TeamSubscription)
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{meetingId: RetroDemo.MEETING_ID}}
      render={({props}) => {
        if (props) {
          return <RetroMeeting meeting={(props as any).viewer.meeting} />
        }
        return null
      }}
    />
  )
}

export default DemoMeetingRoot
