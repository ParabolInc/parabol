import React from 'react'
import Menu from './Menu'
import MenuItem from './MenuItem'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import RemoveAzureDevopsAuthMutation from '../mutations/RemoveAzureDevopsAuthMutation'
import {MenuMutationProps} from '../hooks/useMutationProps'
import AzureDevopsClientManager from '../utils/AzureDevopsClientManager'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  teamId: string
}

const AzureDevopsConfigMenu = (props: Props) => {
  const {menuProps, mutationProps, teamId} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()
  const openOAuth = () => {
    AzureDevopsClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }

  const removeAzureDevops = () => {
    if (submitting) return
    submitMutation()
    RemoveAzureDevopsAuthMutation(atmosphere, {teamId}, {onError, onCompleted})
  }
  return (
    <Menu ariaLabel={'Configure your Azure Devops integration'} {...menuProps}>
      <MenuItem label='Refresh token' onClick={openOAuth} />
      <MenuItem label='Remove Azure Devops' onClick={removeAzureDevops} />
    </Menu>
  )
}

export default AzureDevopsConfigMenu
