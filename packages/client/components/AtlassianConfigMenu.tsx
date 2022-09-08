import React from 'react'
import {useTranslation} from 'react-i18next'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'
import RemoveAtlassianAuthMutation from '../mutations/RemoveAtlassianAuthMutation'
import AtlassianClientManager from '../utils/AtlassianClientManager'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  teamId: string
}

const AtlassianConfigMenu = (props: Props) => {
  const {menuProps, mutationProps, teamId} = props

  const {t} = useTranslation()

  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()
  const openOAuth = () => {
    AtlassianClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }

  const removeAtlassian = () => {
    if (submitting) return
    submitMutation()
    RemoveAtlassianAuthMutation(atmosphere, {teamId}, {onError, onCompleted})
  }
  return (
    <Menu ariaLabel={t('AtlassianConfigMenu.ConfigureYourAtlassianIntegration')} {...menuProps}>
      <MenuItem label={t('AtlassianConfigMenu.RefreshToken')} onClick={openOAuth} />
      <MenuItem label={t('AtlassianConfigMenu.RemoveAtlassian')} onClick={removeAtlassian} />
    </Menu>
  )
}

export default AtlassianConfigMenu
