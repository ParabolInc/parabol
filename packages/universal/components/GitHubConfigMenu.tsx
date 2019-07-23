import React from 'react'
import MenuItem from 'universal/components/MenuItem'
import Menu from 'universal/components/Menu'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import {MenuProps} from 'universal/hooks/useMenu'
import RemoveGitHubAuthMutation from 'universal/mutations/RemoveGitHubAuthMutation'
import {MenuMutationProps} from 'universal/hooks/useMutationProps'
import GitHubClientManager from 'universal/utils/GitHubClientManager'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  teamId: string
}

const GitHubConfigMenu = (props: Props) => {
  const {menuProps, mutationProps, teamId} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()
  const openOAuth = () => {
    GitHubClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }

  const removeGitHub = () => {
    if (submitting) return
    submitMutation()
    RemoveGitHubAuthMutation(atmosphere, {teamId}, {onCompleted, onError})
  }
  return (
    <Menu ariaLabel={'Configure your GitHub integration'} {...menuProps}>
      <MenuItem label='Refresh token' onClick={openOAuth} />
      <MenuItem label='Remove GitHub' onClick={removeGitHub} />
    </Menu>
  )
}

export default GitHubConfigMenu
