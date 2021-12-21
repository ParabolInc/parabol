import React from 'react'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuProps} from '../../../../hooks/useMenu'
import {MenuMutationProps} from '../../../../hooks/useMutationProps'
import RemoveMattermostAuthMutation from '../../../../mutations/RemoveMattermostAuthMutation'
import Menu from '../../../../components/Menu'
import MenuItem from '../../../../components/MenuItem'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  teamId: string
}

const MattermostConfigMenu = (props: Props) => {
  const {menuProps, mutationProps, teamId} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()

  const removeMattermostAuth = () => {
    if (submitting) return
    submitMutation()
    RemoveMattermostAuthMutation(atmosphere, {teamId}, {onCompleted, onError})
  }
  return (
    <Menu ariaLabel={'Configure your Mattermost integration'} {...menuProps}>
      <MenuItem label='Remove Mattermost' onClick={removeMattermostAuth} />
    </Menu>
  )
}

export default MattermostConfigMenu
