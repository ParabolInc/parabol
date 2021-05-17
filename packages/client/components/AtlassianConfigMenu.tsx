import React, {useCallback} from 'react'
import Menu from './Menu'
import MenuItem from './MenuItem'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import RemoveAtlassianAuthMutation from '../mutations/RemoveAtlassianAuthMutation'
import {MenuMutationProps} from '../hooks/useMutationProps'
import AtlassianClientManager from '../utils/AtlassianClientManager'
import AddAtlassianAuthMutation from '../mutations/AddAtlassianAuthMutation'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  teamId: string
}

const AtlassianConfigMenu = (props: Props) => {
  const {menuProps, mutationProps, teamId} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()

  const onAtlassianOAuthCompleted = useCallback(
    (code) => {
      if (mutationProps.submitting) {
        return
      }

      mutationProps.submitMutation()
      AddAtlassianAuthMutation(atmosphere, {code, teamId}, {onError, onCompleted})
    },
    [mutationProps, teamId]
  )
  const openOAuth = () => {
    AtlassianClientManager.openOAuth(onAtlassianOAuthCompleted)
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
