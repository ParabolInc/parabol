import graphql from 'babel-plugin-relay/macro'
import type {MeetingMembersWithTasks_meeting$key} from 'parabol-client/__generated__/MeetingMembersWithTasks_meeting.graphql'
import {useFragment} from 'react-relay'
import useAtmosphere from '../../../../../hooks/useAtmosphere'
import EmailBorderBottom from './EmailBorderBottom'
import MeetingMemberTaskSummaryList from './MeetingMemberTaskSummaryList'
import sortSummaryMembers from './sortSummaryMembers'

interface Props {
  meeting: MeetingMembersWithTasks_meeting$key
}

const MeetingMembersWithTasks = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment MeetingMembersWithTasks_meeting on NewMeeting {
        meetingMembers {
          id
          userId
          user {
            preferredName
          }
          ...MeetingMemberTaskSummaryList_meetingMember
          ... on ActionMeetingMember {
            doneTasks {
              id
            }
            tasks {
              id
            }
          }
          ... on RetrospectiveMeetingMember {
            tasks {
              id
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {viewerId} = useAtmosphere()
  const {meetingMembers} = meeting
  const meetingMembersWithTasks = sortSummaryMembers(
    meetingMembers.filter(
      ({doneTasks, tasks}) => (tasks ? tasks.length : 0) + (doneTasks ? doneTasks.length : 0) > 0
    ),
    viewerId
  )
  if (meetingMembersWithTasks.length === 0) return null
  return (
    <>
      {meetingMembersWithTasks.map((member) => (
        <MeetingMemberTaskSummaryList meetingMember={member} key={member.id} />
      ))}
      <EmailBorderBottom />
    </>
  )
}

export default MeetingMembersWithTasks
