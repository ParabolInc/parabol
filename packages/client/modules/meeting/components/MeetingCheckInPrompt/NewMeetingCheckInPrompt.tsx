import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {NewMeetingCheckInPrompt_meeting$key} from '~/__generated__/NewMeetingCheckInPrompt_meeting.graphql'
import {NewMeetingCheckInPrompt_teamMember$key} from '../../../../__generated__/NewMeetingCheckInPrompt_teamMember.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import NewMeetingCheckInGreeting from '../NewMeetingCheckInGreeting'
import NewCheckInQuestion from './NewCheckInQuestion'

const PromptBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '37.5rem',
  padding: '0 1.25rem'
})

const AvatarBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  paddingBottom: 16
})

const CheckInBlock = styled('div')({
  width: '100%'
})

interface Props {
  meeting: NewMeetingCheckInPrompt_meeting$key
  teamMember: NewMeetingCheckInPrompt_teamMember$key
}

const NewMeetingCheckinPrompt = (props: Props) => {
  const {meeting: meetingRef, teamMember: teamMemberRef} = props
  const meeting = useFragment(
    graphql`
      fragment NewMeetingCheckInPrompt_meeting on NewMeeting {
        ...NewCheckInQuestion_meeting
        localPhase {
          phaseType
          id
          ... on CheckInPhase {
            checkInGreeting {
              ...NewMeetingCheckInGreeting_checkInGreeting
            }
          }
        }
        # request question from server to use locally (above)
        phases {
          ... on CheckInPhase {
            checkInGreeting {
              ...NewMeetingCheckInGreeting_checkInGreeting
            }
          }
        }
      }
    `,
    meetingRef
  )
  const teamMember = useFragment(
    graphql`
      fragment NewMeetingCheckInPrompt_teamMember on TeamMember {
        ...NewMeetingCheckInGreeting_teamMember
        picture
      }
    `,
    teamMemberRef
  )
  const {picture} = teamMember
  const {localPhase} = meeting
  const {checkInGreeting} = localPhase
  return (
    <PromptBlock>
      <AvatarBlock>
        <Avatar picture={picture} className={`h-32 w-32 sidebar-left:h-40 sidebar-left:w-40`} />
      </AvatarBlock>
      <CheckInBlock>
        <NewMeetingCheckInGreeting checkInGreeting={checkInGreeting!} teamMember={teamMember} />
        <NewCheckInQuestion meeting={meeting} />
      </CheckInBlock>
    </PromptBlock>
  )
}

export default NewMeetingCheckinPrompt
