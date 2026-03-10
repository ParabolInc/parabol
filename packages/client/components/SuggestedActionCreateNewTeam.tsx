import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router-dom'
import type {SuggestedActionCreateNewTeam_suggestedAction$key} from '../__generated__/SuggestedActionCreateNewTeam_suggestedAction.graphql'
import {PALETTE} from '../styles/paletteV3'
import SuggestedActionButton from './SuggestedActionButton'
import SuggestedActionCard from './SuggestedActionCard'
import SuggestedActionCopy from './SuggestedActionCopy'

interface Props {
  suggestedAction: SuggestedActionCreateNewTeam_suggestedAction$key
}

const SuggestedActionCreateNewTeam = (props: Props) => {
  const navigate = useNavigate()
  const onClick = () => {
    navigate('/newteam')
  }

  const {suggestedAction: suggestedActionRef} = props
  const suggestedAction = useFragment(
    graphql`
      fragment SuggestedActionCreateNewTeam_suggestedAction on SuggestedActionCreateNewTeam {
        id
      }
    `,
    suggestedActionRef
  )
  const {id: suggestedActionId} = suggestedAction
  return (
    <SuggestedActionCard
      backgroundColor={PALETTE.JADE_400}
      iconName='group_add'
      suggestedActionId={suggestedActionId}
    >
      <SuggestedActionCopy>Create a new team to collaborate with other groups</SuggestedActionCopy>
      <SuggestedActionButton onClick={onClick}>Create New Team</SuggestedActionButton>
    </SuggestedActionCard>
  )
}

export default SuggestedActionCreateNewTeam
