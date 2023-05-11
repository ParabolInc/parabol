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
    // TODO: implement
  }

  const removeGcal = () => {
    if (submitting) return
    submitMutation()
  }
  return (
    <Menu ariaLabel={'Configure your Google Calendar integration'} {...menuProps}>
      <MenuItem label='Refresh token' onClick={openOAuth} />
      <MenuItem label='Remove Google Calendar' onClick={removeGcal} />
    </Menu>
  )
}

export default GcalConfigMenu
