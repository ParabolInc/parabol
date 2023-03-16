import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import SetOrgUserRoleMutation from '../mutations/SetOrgUserRoleMutation'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import {BillingLeaderActionMenu_organization$key} from '../__generated__/BillingLeaderActionMenu_organization.graphql'
import {BillingLeaderActionMenu_organizationUser$key} from '../__generated__/BillingLeaderActionMenu_organizationUser.graphql'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props extends WithMutationProps {
  menuProps: MenuProps
  isViewerLastBillingLeader: boolean
  organizationUser: BillingLeaderActionMenu_organizationUser$key
  organization: BillingLeaderActionMenu_organization$key
  toggleLeave: () => void
  toggleRemove: () => void
}

const BillingLeaderActionMenu = (props: Props) => {
  const {
    menuProps,
    isViewerLastBillingLeader,
    organizationUser: organizationUserRef,
    submitting,
    submitMutation,
    onError,
    onCompleted,
    organization: organizationRef,
    toggleLeave,
    toggleRemove
  } = props
  const organization = useFragment(
    graphql`
      fragment BillingLeaderActionMenu_organization on Organization {
        id
        tier
      }
    `,
    organizationRef
  )
  const organizationUser = useFragment(
    graphql`
      fragment BillingLeaderActionMenu_organizationUser on OrganizationUser {
        role
        newUserUntil
        user {
          id
        }
      }
    `,
    organizationUserRef
  )
  const atmosphere = useAtmosphere()
  const {id: orgId, tier} = organization
  const {viewerId} = atmosphere
  const {newUserUntil, role, user} = organizationUser
  const isBillingLeader = role === 'BILLING_LEADER'
  const {id: userId} = user

  const setRole =
    (role: string | null = null) =>
    () => {
      if (submitting) return
      submitMutation()
      const variables = {orgId, userId, role}
      SetOrgUserRoleMutation(atmosphere, variables, {onError, onCompleted})
    }

  return (
    <>
      <Menu ariaLabel={'Select your action'} {...menuProps}>
        {isBillingLeader && !isViewerLastBillingLeader && (
          <MenuItem label='Remove Billing Leader role' onClick={setRole(null)} />
        )}
        {!isBillingLeader && (
          <MenuItem label='Promote to Billing Leader' onClick={setRole('BILLING_LEADER')} />
        )}
        {viewerId === userId && !isViewerLastBillingLeader && (
          <MenuItem label='Leave Organization' onClick={toggleLeave} />
        )}
        {viewerId !== userId && (
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
    </>
  )
}

export default withMutationProps(BillingLeaderActionMenu)
