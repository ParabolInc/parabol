import React from 'react'
import {useTranslation} from 'react-i18next'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'
import RemoveGitHubAuthMutation from '../mutations/RemoveGitHubAuthMutation'
import {Duration} from '../types/constEnums'
import GitHubClientManager from '../utils/GitHubClientManager'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  teamId: string
}

const GitHubConfigMenu = (props: Props) => {
  const {menuProps, mutationProps, teamId} = props

  //FIXME i18n: Refresh token
  //FIXME i18n: Remove GitHub
  const {t} = useTranslation()

  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()
  const openOAuth = () => {
    GitHubClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }

  const removeGitHub = () => {
    if (submitting) return
    submitMutation()
    // wait for the portal to animate closed before removing, otherwise it'll stick around forever
    setTimeout(() => {
      RemoveGitHubAuthMutation(atmosphere, {teamId}, {onCompleted, onError})
    }, Duration.PORTAL_CLOSE)
  }
  return (
    <Menu ariaLabel={t('GitHubConfigMenu.ConfigureYourGithubIntegration')} {...menuProps}>
      <MenuItem label='Refresh token' onClick={openOAuth} />
      <MenuItem label='Remove GitHub' onClick={removeGitHub} />
    </Menu>
  )
}

export default GitHubConfigMenu
