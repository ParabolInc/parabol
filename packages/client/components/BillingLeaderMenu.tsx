import React from 'react'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import useMutationProps from '../hooks/useMutationProps'
import SetOrgUserRoleMutation from '../mutations/SetOrgUserRoleMutation'
import Menu from './Menu'
import MenuItem from './MenuItem'

type Props = {
  menuProps: MenuProps
  userId: string
  toggleLeave: () => void
  toggleRemove: () => void
  orgId: string
}

const BillingLeaderMenu = (props: Props) => {
  const {menuProps, toggleRemove, userId, toggleLeave, orgId} = props
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
  const {viewerId} = atmosphere
  const isViewer = viewerId === userId

  const removeBillingLeader = () => {
    if (submitting) return
    submitMutation()
    const variables = {orgId, userId, role: null}
    SetOrgUserRoleMutation(atmosphere, variables, {onError, onCompleted})
  }

  return (
    <Menu ariaLabel={'Select your action'} {...menuProps}>
      <MenuItem label='Remove Billing Leader role' onClick={removeBillingLeader} />
      {isViewer && <MenuItem onClick={toggleLeave} label='Leave Organization' />}
      {!isViewer && <MenuItem label={'Remove from Organization'} onClick={toggleRemove} />}
    </Menu>
  )
}

export default BillingLeaderMenu
