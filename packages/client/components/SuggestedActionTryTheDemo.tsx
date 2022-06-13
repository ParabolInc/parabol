import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router'
import useAtmosphere from '~/hooks/useAtmosphere'
import DismissSuggestedActionMutation from '../mutations/DismissSuggestedActionMutation'
import {PALETTE} from '../styles/paletteV3'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import {SuggestedActionTryTheDemo_suggestedAction} from '../__generated__/SuggestedActionTryTheDemo_suggestedAction.graphql'
import SuggestedActionButton from './SuggestedActionButton'
import SuggestedActionCard from './SuggestedActionCard'
import SuggestedActionCopy from './SuggestedActionCopy'

interface Props extends WithMutationProps, RouteComponentProps<{[x: string]: string | undefined}> {
  suggestedAction: SuggestedActionTryTheDemo_suggestedAction
}

const SuggestedActionTryTheDemo = (props: Props) => {
  const atmosphere = useAtmosphere()
  const onClick = () => {
    const {history, submitting, submitMutation, suggestedAction, onError, onCompleted} = props
    const {id: suggestedActionId} = suggestedAction
    if (submitting) return
    submitMutation()
    DismissSuggestedActionMutation(atmosphere, {suggestedActionId}, {onError, onCompleted})
    history.push('/retrospective-demo')
  }

  const {suggestedAction} = props
  const {id: suggestedActionId} = suggestedAction
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

export default createFragmentContainer(withMutationProps(withRouter(SuggestedActionTryTheDemo)), {
  suggestedAction: graphql`
    fragment SuggestedActionTryTheDemo_suggestedAction on SuggestedActionTryTheDemo {
      id
    }
  `
})
