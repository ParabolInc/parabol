import React from 'react'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
}

const GcalConfigMenu = (props: Props) => {
  const {menuProps, mutationProps} = props
  const {submitMutation, submitting} = mutationProps
  const openOAuth = () => {
    // TODO: implement pauth
    // GcalClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }

  const removeGcal = () => {
    if (submitting) return
    submitMutation()
    // TODO: implement remove auth
    // wait for the portal to animate closed before removing, otherwise it'll stick around forever
    // setTimeout(() => {
    //   RemoveGcalAuthMutation(atmosphere, {teamId}, {onCompleted, onError})
    // }, Duration.PORTAL_CLOSE)
  }
  return (
    <Menu ariaLabel={'Configure your Google Calendar integration'} {...menuProps}>
      <MenuItem label='Refresh token' onClick={openOAuth} />
      <MenuItem label='Remove Google Calendar' onClick={removeGcal} />
    </Menu>
  )
}

export default GcalConfigMenu
