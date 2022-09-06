import React from 'react'
import {useTranslation} from 'react-i18next'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'
import RemoveSlackAuthMutation from '../mutations/RemoveSlackAuthMutation'
import SlackClientManager from '../utils/SlackClientManager'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  teamId: string
}

const SlackConfigMenu = (props: Props) => {
  const {menuProps, mutationProps, teamId} = props

  //FIXME i18n: Refresh token
  //FIXME i18n: Remove Slack
  const {t} = useTranslation()

  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()
  const openOAuth = () => {
    SlackClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }

  const removeSlack = () => {
    if (submitting) return
    submitMutation()
    RemoveSlackAuthMutation(atmosphere, {teamId}, {onCompleted, onError})
  }
  return (
    <Menu ariaLabel={t('SlackConfigMenu.ConfigureYourSlackIntegration')} {...menuProps}>
      <MenuItem label='Refresh token' onClick={openOAuth} />
      <MenuItem label='Remove Slack' onClick={removeSlack} />
    </Menu>
  )
}

export default SlackConfigMenu
