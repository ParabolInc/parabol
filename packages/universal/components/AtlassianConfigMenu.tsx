import React from 'react'
import Menu from 'universal/components/Menu'
import MenuItem from 'universal/components/MenuItem'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import {MenuProps} from 'universal/hooks/useMenu'
import RemoveAtlassianAuthMutation from 'universal/mutations/RemoveAtlassianAuthMutation'
import {MenuMutationProps} from 'universal/hooks/useMutationProps'
import AtlassianClientManager from 'universal/utils/AtlassianClientManager'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  teamId: string
}

const AtlassianConfigMenu = (props: Props) => {
  const {menuProps, mutationProps, teamId} = props
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
    <Menu ariaLabel={'Configure your Atlassian integration'} {...menuProps}>
      <MenuItem label='Refresh token' onClick={openOAuth} />
      <MenuItem label='Remove Atlassian' onClick={removeAtlassian} />
    </Menu>
  )
}

export default AtlassianConfigMenu
