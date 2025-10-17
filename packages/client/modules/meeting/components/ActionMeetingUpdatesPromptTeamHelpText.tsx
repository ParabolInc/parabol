import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ActionMeetingUpdatesPromptTeamHelpText_currentMeetingMember$key} from '../../../__generated__/ActionMeetingUpdatesPromptTeamHelpText_currentMeetingMember.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {PALETTE} from '../../../styles/paletteV3'

const AgendaControl = styled('span')({
  color: PALETTE.SKY_500,
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline'
  }
})

interface Props {
  currentMeetingMember: ActionMeetingUpdatesPromptTeamHelpText_currentMeetingMember$key
}

const ActionMeetingUpdatesPromptTeamHelpText = (props: Props) => {
  const {currentMeetingMember: currentMeetingMemberRef} = props
  const currentMeetingMember = useFragment(
    graphql`
      fragment ActionMeetingUpdatesPromptTeamHelpText_currentMeetingMember on ActionMeetingMember {
        isConnectedAt
        user {
          preferredName
        }
      }
    `,
    currentMeetingMemberRef
  )
  const atmosphere = useAtmosphere()
  const handleAgendaControl = () => {
    atmosphere.eventEmitter.emit('focusAgendaInput')
  }
  const {user, isConnectedAt} = currentMeetingMember
  const {preferredName} = user
  return (
    <span>
      <span>{!isConnectedAt ? '(' : `(${preferredName} is sharing. `}</span>
      <AgendaControl onClick={handleAgendaControl}>{'Add agenda items'}</AgendaControl>
      {' for discussion.)'}
    </span>
  )
}

export default ActionMeetingUpdatesPromptTeamHelpText
