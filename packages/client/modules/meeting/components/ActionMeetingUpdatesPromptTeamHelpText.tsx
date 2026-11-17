import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ActionMeetingUpdatesPromptTeamHelpText_currentMeetingMember$key} from '../../../__generated__/ActionMeetingUpdatesPromptTeamHelpText_currentMeetingMember.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'

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
      <span className='cursor-pointer text-accent hover:underline' onClick={handleAgendaControl}>
        {'Add agenda items'}
      </span>
      {' for discussion.)'}
    </span>
  )
}

export default ActionMeetingUpdatesPromptTeamHelpText
