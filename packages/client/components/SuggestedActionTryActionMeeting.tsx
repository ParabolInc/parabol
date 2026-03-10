import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router-dom'
import type {SuggestedActionTryActionMeeting_suggestedAction$key} from '../__generated__/SuggestedActionTryActionMeeting_suggestedAction.graphql'
import {PALETTE} from '../styles/paletteV3'
import SuggestedActionButton from './SuggestedActionButton'
import SuggestedActionCard from './SuggestedActionCard'
import SuggestedActionCopy from './SuggestedActionCopy'

interface Props {
  suggestedAction: SuggestedActionTryActionMeeting_suggestedAction$key
}

const SuggestedActionTryActionMeeting = (props: Props) => {
  const navigate = useNavigate()
  const {suggestedAction: suggestedActionRef} = props
  const suggestedAction = useFragment(
    graphql`
      fragment SuggestedActionTryActionMeeting_suggestedAction on SuggestedActionTryActionMeeting {
        id
        team {
          id
          name
        }
      }
    `,
    suggestedActionRef
  )
  const {id: suggestedActionId, team} = suggestedAction
  const {name: teamName} = team

  const onClick = () => {
    navigate(`/activity-library/category/standup`)
  }

  return (
    <SuggestedActionCard
      backgroundColor={PALETTE.AQUA_400}
      iconName='change_history'
      suggestedActionId={suggestedActionId}
    >
      <SuggestedActionCopy>Hold your first Check-in Meeting with {teamName}</SuggestedActionCopy>
      <SuggestedActionButton onClick={onClick}>Start Check-in Meeting</SuggestedActionButton>
    </SuggestedActionCard>
  )
}

export default SuggestedActionTryActionMeeting
