import React from 'react'
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

const MSTeamsConfigMenu = (props: Props) => {
  const {menuProps, mutationProps, providerId} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()

  const removeMSTeamsAuth = () => {
    if (submitting) return
    submitMutation()
    // wait for the portal to animate closed before removing, otherwise it'll stick around forever
    setTimeout(() => {
      RemoveIntegrationProviderMutation(atmosphere, {providerId}, {onCompleted, onError})
    }, Duration.PORTAL_CLOSE)
  }
  return (
    <Menu ariaLabel={'Configure your Microsoft Teams integration'} {...menuProps}>
      <MenuItem label='Remove Microsoft Teams' onClick={removeMSTeamsAuth} />
    </Menu>
  )
}

export default MSTeamsConfigMenu
