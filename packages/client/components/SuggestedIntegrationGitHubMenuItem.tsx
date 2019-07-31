import {SuggestedIntegrationGitHubMenuItem_suggestedIntegration} from '../__generated__/SuggestedIntegrationGitHubMenuItem_suggestedIntegration.graphql'
import React, {forwardRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import GitHubSVG from './GitHubSVG'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import SuggestedIntegrationMenuItemAvatar from './SuggestedIntegrationMenuItemAvatar'
import useAtmosphere from '../hooks/useAtmosphere'
import CreateGitHubIssueMutation from '../mutations/CreateGitHubIssueMutation'
import {WithMutationProps} from '../utils/relay/withMutationProps'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  suggestedIntegration: SuggestedIntegrationGitHubMenuItem_suggestedIntegration
  taskId: string
  submitMutation: WithMutationProps['submitMutation']
  onError: WithMutationProps['onError']
  onCompleted: WithMutationProps['onCompleted']
  query: string
}

const SuggestedIntegrationGitHubMenuItem = forwardRef((props: Props, ref: any) => {
  const {query, suggestedIntegration, taskId, submitMutation, onError, onCompleted} = props
  const {nameWithOwner} = suggestedIntegration
  const atmosphere = useAtmosphere()
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <SuggestedIntegrationMenuItemAvatar>
            <GitHubSVG />
          </SuggestedIntegrationMenuItemAvatar>
          <TypeAheadLabel query={query} label={nameWithOwner} />
        </MenuItemLabel>
      }
      onClick={() => {
        const variables = {nameWithOwner, taskId}
        submitMutation()
        CreateGitHubIssueMutation(atmosphere, variables, {onError, onCompleted})
      }}
    />
  )
})

export default createFragmentContainer(SuggestedIntegrationGitHubMenuItem, {
  suggestedIntegration: graphql`
    fragment SuggestedIntegrationGitHubMenuItem_suggestedIntegration on SuggestedIntegrationGitHub {
      nameWithOwner
    }
  `
})
