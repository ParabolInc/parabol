import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import SetOrgUserRoleMutation from '../mutations/SetOrgUserRoleMutation'
import {BillingLeaderMenu_user$key} from '../__generated__/ BillingLeaderMenu_user.graphql'
import Menu from './Menu'
import MenuItem from './MenuItem'
import useMutationProps from '../hooks/useMutationProps'

type Props = {
  menuProps: MenuProps
  billingLeaderRef: BillingLeaderMenu_user$key
  toggleLeave: () => void
  toggleRemove: () => void
}

const BillingLeaderMenu = (props: Props) => {
  const {menuProps, toggleRemove, billingLeaderRef, toggleLeave} = props
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
  const billingLeader = useFragment(
    graphql`
      fragment BillingLeaderMenu_user on User {
        id
        organizationUser(orgId: $orgId) {
          id
          newUserUntil
          tier
          orgId
        }
      }
    `,
    billingLeaderRef
  )
  const {viewerId} = atmosphere
  const {id: userId, organizationUser} = billingLeader
  const {newUserUntil, tier, orgId} = organizationUser
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
      {!isViewer && (
        <MenuItem
          label={
            tier === 'team' && new Date(newUserUntil) > new Date()
              ? 'Refund and Remove'
              : 'Remove from Organization'
          }
          onClick={toggleRemove}
        />
      )}
    </Menu>
  )
}

export default BillingLeaderMenu
