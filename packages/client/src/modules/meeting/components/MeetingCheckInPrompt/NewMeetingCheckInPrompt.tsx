import {NewMeetingCheckInPrompt_teamMember} from '../../../../__generated__/NewMeetingCheckInPrompt_teamMember.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Avatar from '../../../../components/Avatar/Avatar'
import NewCheckInQuestion from './NewCheckInQuestion'
import NewMeetingCheckInGreeting from '../NewMeetingCheckInGreeting'
import defaultUserAvatar from '../../../../styles/theme/images/avatar-user.svg'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {Breakpoint} from '../../../../types/constEnums'
import {NewMeetingCheckInPrompt_meeting} from 'parabol-client/src/__generated__/NewMeetingCheckInPrompt_meeting.graphql'

const PromptBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  maxWidth: '37.5rem',
  padding: '0 1.25rem'
})

const AvatarBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  paddingBottom: 16
})

interface Props {
  meeting: NewMeetingCheckInPrompt_meeting
  teamMember: NewMeetingCheckInPrompt_teamMember
}

const NewMeetingCheckinPrompt = (props: Props) => {
  const {meeting, teamMember} = props
  const isLargeViewport = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const {picture} = teamMember
  const {localPhase} = meeting
  const {checkInGreeting} = localPhase
  const size = isLargeViewport ? 160 : 128
  return (
    <PromptBlock>
      <AvatarBlock>
        <Avatar picture={picture || defaultUserAvatar} size={size} />
      </AvatarBlock>
      <div>
        <NewMeetingCheckInGreeting checkInGreeting={checkInGreeting!} teamMember={teamMember} />
        <NewCheckInQuestion meeting={meeting} />
      </div>
    </PromptBlock>
  )
}

export default createFragmentContainer(NewMeetingCheckinPrompt, {
  meeting: graphql`
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
  teamMember: graphql`
    fragment NewMeetingCheckInPrompt_teamMember on TeamMember {
      ...NewMeetingCheckInGreeting_teamMember
      picture
    }
  `
})
