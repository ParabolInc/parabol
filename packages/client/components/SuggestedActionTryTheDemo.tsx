import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {type RouteComponentProps, withRouter} from 'react-router'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import type {SuggestedActionTryTheDemo_suggestedAction$key} from '../__generated__/SuggestedActionTryTheDemo_suggestedAction.graphql'
import DismissSuggestedActionMutation from '../mutations/DismissSuggestedActionMutation'
import {PALETTE} from '../styles/paletteV3'
import SuggestedActionButton from './SuggestedActionButton'
import SuggestedActionCard from './SuggestedActionCard'
import SuggestedActionCopy from './SuggestedActionCopy'

interface Props extends RouteComponentProps<{[x: string]: string | undefined}> {
  suggestedAction: SuggestedActionTryTheDemo_suggestedAction$key
}

const SuggestedActionTryTheDemo = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()

  const {suggestedAction: suggestedActionRef} = props
  const suggestedAction = useFragment(
    graphql`
      fragment SuggestedActionTryTheDemo_suggestedAction on SuggestedActionTryTheDemo {
        id
      }
    `,
    suggestedActionRef
  )
  const {id: suggestedActionId} = suggestedAction

  const onClick = () => {
    const {history} = props
    if (submitting) return
    submitMutation()
    DismissSuggestedActionMutation(atmosphere, {suggestedActionId}, {onError, onCompleted})
    history.push('/retrospective-demo')
  }
  return (
    <SuggestedActionCard
      backgroundColor={PALETTE.GOLD_300}
      iconName='group_work'
      suggestedActionId={suggestedActionId}
    >
      <SuggestedActionCopy>
        Run a 2-minute demo retrospective with a scripted team
      </SuggestedActionCopy>
      <SuggestedActionButton onClick={onClick}>Try the Demo</SuggestedActionButton>
    </SuggestedActionCard>
  )
}

export default withRouter(SuggestedActionTryTheDemo)
