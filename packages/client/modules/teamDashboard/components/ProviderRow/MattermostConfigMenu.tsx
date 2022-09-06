import React from 'react'
import {useTranslation} from 'react-i18next'
import Menu from '../../../../components/Menu'
import MenuItem from '../../../../components/MenuItem'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuProps} from '../../../../hooks/useMenu'
import {MenuMutationProps} from '../../../../hooks/useMutationProps'
import RemoveIntegrationProviderMutation from '../../../../mutations/RemoveIntegrationProviderMutation'
import {Duration} from '../../../../types/constEnums'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  providerId: string
}

const MattermostConfigMenu = (props: Props) => {
  const {menuProps, mutationProps, providerId} = props

  //FIXME i18n: Remove Mattermost
  const {t} = useTranslation()

  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()

  const removeMattermostAuth = () => {
    if (submitting) return
    submitMutation()
    // wait for the portal to animate closed before removing, otherwise it'll stick around forever
    setTimeout(() => {
      RemoveIntegrationProviderMutation(atmosphere, {providerId}, {onCompleted, onError})
    }, Duration.PORTAL_CLOSE)
  }
  return (
    <Menu ariaLabel={t('MattermostConfigMenu.ConfigureYourMattermostIntegration')} {...menuProps}>
      <MenuItem label='Remove Mattermost' onClick={removeMattermostAuth} />
    </Menu>
  )
}

export default MattermostConfigMenu
