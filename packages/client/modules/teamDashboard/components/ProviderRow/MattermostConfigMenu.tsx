import React from 'react'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuProps} from '../../../../hooks/useMenu'
import {MenuMutationProps} from '../../../../hooks/useMutationProps'
import RemoveIntegrationProviderMutation from '../../../../mutations/RemoveIntegrationProviderMutation'
import Menu from '../../../../components/Menu'
import MenuItem from '../../../../components/MenuItem'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  teamId: string
  providerId: string
  terminatePortal: () => void
}

const MattermostConfigMenu = (props: Props) => {
  const {menuProps, mutationProps, providerId, teamId, terminatePortal} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()

  const removeMattermostAuth = () => {
    if (submitting) return
    submitMutation()
    RemoveIntegrationProviderMutation(atmosphere, {providerId, teamId}, {onCompleted, onError})
    // Our parent component does not unmount, and it often re-renders before the CSS menu transition
    // can complete. We nuke the portal here to ensure the menu is closed.
    terminatePortal()
  }
  return (
    <Menu ariaLabel={'Configure your Mattermost integration'} {...menuProps}>
      <MenuItem label='Remove Mattermost' onClick={removeMattermostAuth} />
    </Menu>
  )
}

export default MattermostConfigMenu
