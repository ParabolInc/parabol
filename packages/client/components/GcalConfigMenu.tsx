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
  // const openOAuth = () => {
  // TODO: implement
  // GcalClientManager.openOAuth(atmosphere, teamId, mutationProps)
  // }

  const removeGcal = () => {
    if (submitting) return
    submitMutation()
    // TODO: implement remove auth
    // wait for the portal to animate closed before removing, otherwise it'll stick around forever
  }
  return (
    <Menu ariaLabel={'Configure your Google Calendar integration'} {...menuProps}>
      <MenuItem label='Remove Google Calendar' onClick={removeGcal} />
    </Menu>
  )
}

export default GcalConfigMenu
