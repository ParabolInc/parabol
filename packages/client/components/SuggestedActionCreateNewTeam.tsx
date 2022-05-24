import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router'
import {PALETTE} from '../styles/paletteV3'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import {SuggestedActionCreateNewTeam_suggestedAction} from '../__generated__/SuggestedActionCreateNewTeam_suggestedAction.graphql'
import SuggestedActionButton from './SuggestedActionButton'
import SuggestedActionCard from './SuggestedActionCard'
import SuggestedActionCopy from './SuggestedActionCopy'

interface Props extends WithMutationProps, RouteComponentProps<{[x: string]: string | undefined}> {
  suggestedAction: SuggestedActionCreateNewTeam_suggestedAction
}

const SuggestedActionCreateNewTeam = (props: Props) => {
  const onClick = () => {
    const {history} = props
    history.push('/newteam')
  }

  const {suggestedAction} = props
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

export default createFragmentContainer(
  withMutationProps(withRouter(SuggestedActionCreateNewTeam)),
  {
    suggestedAction: graphql`
      fragment SuggestedActionCreateNewTeam_suggestedAction on SuggestedActionCreateNewTeam {
        id
      }
    `
  }
)
