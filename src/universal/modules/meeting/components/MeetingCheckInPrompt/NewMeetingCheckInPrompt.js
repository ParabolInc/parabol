// @flow
import * as React from 'react'
import {createFragmentContainer} from 'react-relay'
import NewMeetingCheckInGreeting from 'universal/modules/meeting/components/NewMeetingCheckInGreeting'
import NewCheckInQuestion from 'universal/modules/meeting/components/MeetingCheckInPrompt/NewCheckInQuestion'
import Avatar from 'universal/components/Avatar/Avatar'
import styled from 'react-emotion'
import {meetingSidebarMediaQuery} from 'universal/styles/meeting'
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg'

import type {NewCheckInQuestion_team as Team} from './__generated__/NewMeetingCheckInPrompt_team.graphql'
import type {NewCheckInQuestion_team as TeamMember} from './__generated__/NewMeetingCheckInPrompt_teamMember.graphql'

const PromptBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  maxWidth: '37.5rem',
  padding: '0 1.25rem',

  [meetingSidebarMediaQuery]: {
    // flexDirection: 'row'
  }
})

const AvatarBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  padding: '.75rem',
  width: '8rem',

  [meetingSidebarMediaQuery]: {
    padding: '1rem',
    width: '10rem'
  }
})

type Props = {
  team: Team,
  teamMember: TeamMember
}

const NewMeetingCheckinPrompt = (props: Props) => {
  const {team, teamMember} = props
  const {picture} = teamMember
  const {
    newMeeting: {
      localPhase: {checkInGreeting}
    }
  } = team
  return (
    <PromptBlock>
      <AvatarBlock>
        <Avatar picture={picture || defaultUserAvatar} size='fill' />
      </AvatarBlock>
      <div>
        <NewMeetingCheckInGreeting checkInGreeting={checkInGreeting} teamMember={teamMember} />
        <NewCheckInQuestion team={team} />
      </div>
    </PromptBlock>
  )
}

export default createFragmentContainer(
  NewMeetingCheckinPrompt,
  graphql`
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

    fragment NewMeetingCheckInPrompt_teamMember on TeamMember {
      ...NewMeetingCheckInGreeting_teamMember
      ...NewMeetingPrompt_teamMember
      picture
    }
  `
)
