import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import {PALETTE} from 'universal/styles/paletteV2'
import {ActionMeetingUpdatesPromptTeamHelpText_currentTeamMember} from '__generated__/ActionMeetingUpdatesPromptTeamHelpText_currentTeamMember.graphql'

const AgendaControl = styled('span')({
  color: PALETTE.TEXT.RED,
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline'
  }
})

interface Props {
  currentTeamMember: ActionMeetingUpdatesPromptTeamHelpText_currentTeamMember
}

const ActionMeetingUpdatesPromptTeamHelpText = (props: Props) => {
  const {currentTeamMember} = props
  const atmosphere = useAtmosphere()
  const handleAgendaControl = () => {
    atmosphere.eventEmitter.emit('focusAgendaInput')
  }
  const {meetingMember} = currentTeamMember
  const isCheckedInFalse = meetingMember && meetingMember.isCheckedIn === false
  return (
    <span>
      <span>{isCheckedInFalse ? '(' : `(${currentTeamMember.preferredName} is sharing. `}</span>
      <AgendaControl onClick={handleAgendaControl}>{'Add agenda items'}</AgendaControl>
      {' for discussion.)'}
    </span>
  )
}

export default createFragmentContainer(
  ActionMeetingUpdatesPromptTeamHelpText,
  graphql`
    fragment ActionMeetingUpdatesPromptTeamHelpText_currentTeamMember on TeamMember {
      preferredName
      meetingMember {
        isCheckedIn
      }
    }
  `
)
