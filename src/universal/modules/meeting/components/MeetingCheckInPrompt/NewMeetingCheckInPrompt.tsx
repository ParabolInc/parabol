import {NewMeetingCheckInPrompt_team} from '__generated__/NewMeetingCheckInPrompt_team.graphql'
import {NewMeetingCheckInPrompt_teamMember} from '__generated__/NewMeetingCheckInPrompt_teamMember.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import Avatar from 'universal/components/Avatar/Avatar'
import NewCheckInQuestion from 'universal/modules/meeting/components/MeetingCheckInPrompt/NewCheckInQuestion'
import NewMeetingCheckInGreeting from 'universal/modules/meeting/components/NewMeetingCheckInGreeting'
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg'
import useBreakpoint from 'universal/hooks/useBreakpoint'
import {DASH_SIDEBAR} from 'universal/components/Dashboard/DashSidebar'

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
  team: NewMeetingCheckInPrompt_team
  teamMember: NewMeetingCheckInPrompt_teamMember
}

const NewMeetingCheckinPrompt = (props: Props) => {
  const {team, teamMember} = props
  const {newMeeting} = team
  const isLargeViewport = useBreakpoint(DASH_SIDEBAR.BREAKPOINT)
  if (!newMeeting) return null
  const {picture} = teamMember
  const checkInGreeting = newMeeting.localPhase.checkInGreeting!
  const size = isLargeViewport ? 160 : 128
  return (
    <PromptBlock>
      <AvatarBlock>
        <Avatar picture={picture || defaultUserAvatar} size={size} />
      </AvatarBlock>
      <div>
        <NewMeetingCheckInGreeting checkInGreeting={checkInGreeting} teamMember={teamMember} />
        <NewCheckInQuestion team={team} />
      </div>
    </PromptBlock>
  )
}

export default createFragmentContainer(NewMeetingCheckinPrompt, {
  team: graphql`
    fragment NewMeetingCheckInPrompt_team on Team {
      ...NewCheckInQuestion_team
      newMeeting {
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
    }
  `,
  teamMember: graphql`
    fragment NewMeetingCheckInPrompt_teamMember on TeamMember {
      ...NewMeetingCheckInGreeting_teamMember
      picture
    }
  `
})
