import React from 'react'
import {useTranslation} from 'react-i18next'
import Menu from '../../../../components/Menu'
import MenuItem from '../../../../components/MenuItem'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuProps} from '../../../../hooks/useMenu'
import {MenuMutationProps} from '../../../../hooks/useMutationProps'
import RemoveTeamMemberIntegrationAuthMutation from '../../../../mutations/RemoveTeamMemberIntegrationAuthMutation'
import {Duration} from '../../../../types/constEnums'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  teamId: string
}

const GitLabConfigMenu = (props: Props) => {
  const {menuProps, mutationProps, teamId} = props

  //FIXME i18n: Remove GitLab
  const {t} = useTranslation()

  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()

  const removeGitLabAuth = () => {
    if (submitting) return
    submitMutation()
    // wait for the portal to animate closed before removing, otherwise it'll stick around forever
    setTimeout(() => {
      RemoveTeamMemberIntegrationAuthMutation(
        atmosphere,
        {service: 'gitlab', teamId},
        {onCompleted, onError}
      )
    }, Duration.PORTAL_CLOSE)
  }
  return (
    <Menu ariaLabel={t('GitLabConfigMenu.ConfigureYourGitlabIntegration')} {...menuProps}>
      <MenuItem label='Remove GitLab' onClick={removeGitLabAuth} />
    </Menu>
  )
}

export default GitLabConfigMenu
