import React from 'react'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuProps} from '../../../../hooks/useMenu'
import {MenuMutationProps} from '../../../../hooks/useMutationProps'
import RemoveIntegrationTokenMutation from '../../../../mutations/RemoveIntegrationTokenMutation'
import Menu from '../../../../components/Menu'
import MenuItem from '../../../../components/MenuItem'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  providerId: string
  teamId: string
  terminatePortal: () => void
}

const GitLabConfigMenu = (props: Props) => {
  const {menuProps, mutationProps, providerId, teamId, terminatePortal} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()

  const removeGitLabAuth = () => {
    if (submitting) return
    submitMutation()
    RemoveIntegrationTokenMutation(atmosphere, {providerId, teamId}, {onCompleted, onError})
    // Our parent component does not unmount, and it often re-renders before the CSS menu transition
    // can complete. We nuke the portal here to ensure the menu is closed.
    terminatePortal()
  }
  return (
    <Menu ariaLabel={'Configure your GitLab integration'} {...menuProps}>
      <MenuItem label='Remove GitLab' onClick={removeGitLabAuth} />
    </Menu>
  )
}

export default GitLabConfigMenu
