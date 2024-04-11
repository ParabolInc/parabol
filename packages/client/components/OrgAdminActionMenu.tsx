import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {OrgAdminActionMenu_organization$key} from '../__generated__/OrgAdminActionMenu_organization.graphql'
import {OrgAdminActionMenu_organizationUser$key} from '../__generated__/OrgAdminActionMenu_organizationUser.graphql'
import {MenuProps} from '../hooks/useMenu'
import useMutationProps from '../hooks/useMutationProps'
import SetOrgUserRoleMutation from '../mutations/SetOrgUserRoleMutation'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props {
  menuProps: MenuProps
  isViewerLastOrgAdmin: boolean
  organizationUser: OrgAdminActionMenu_organizationUser$key
  organization: OrgAdminActionMenu_organization$key
  toggleLeave: () => void
  toggleRemove: () => void
}

const OrgAdminActionMenu = (props: Props) => {
  const {
    menuProps,
    isViewerLastOrgAdmin,
    organizationUser: organizationUserRef,
    organization: organizationRef,
    toggleLeave,
    toggleRemove
  } = props
  const organization = useFragment(
    graphql`
      fragment OrgAdminActionMenu_organization on Organization {
        id
      }
    `,
    organizationRef
  )
  const organizationUser = useFragment(
    graphql`
      fragment OrgAdminActionMenu_organizationUser on OrganizationUser {
        role
        user {
          id
        }
      }
    `,
    organizationUserRef
  )
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
  const {id: orgId} = organization
  const {viewerId} = atmosphere
  const {role, user} = organizationUser
  const {id: userId} = user

  const setRole =
    (role: 'ORG_ADMIN' | 'BILLING_LEADER' | null = null) =>
    () => {
      if (submitting) return
      submitMutation()
      const variables = {orgId, userId, role}
      SetOrgUserRoleMutation(atmosphere, variables, {onError, onCompleted})
    }

  const isOrgAdmin = role === 'ORG_ADMIN'
  const isBillingLeader = role === 'BILLING_LEADER'
  const isSelf = viewerId === userId
  const canRemoveSelf = isSelf && !isViewerLastOrgAdmin
  const roleName = role === 'ORG_ADMIN' ? 'Org Admin' : 'Billing Leader'

  return (
    <>
      <Menu ariaLabel={'Select your action'} {...menuProps}>
        {!isOrgAdmin && <MenuItem label='Promote to Org Admin' onClick={setRole('ORG_ADMIN')} />}
        {!isOrgAdmin && !isBillingLeader && (
          <MenuItem label='Promote to Billing Leader' onClick={setRole('BILLING_LEADER')} />
        )}
        {isOrgAdmin && !isSelf && (
          <MenuItem label='Change to Billing Leader' onClick={setRole('BILLING_LEADER')} />
        )}
        {((role && !isSelf) || canRemoveSelf) && (
          <MenuItem label={`Remove ${roleName} role`} onClick={setRole(null)} />
        )}
        {canRemoveSelf && <MenuItem label='Leave Organization' onClick={toggleLeave} />}
        {!isSelf && <MenuItem label='Remove from Organization' onClick={toggleRemove} />}
        {isSelf && !canRemoveSelf && <MenuItem label='Contact support@parabol.co to be removed' />}
      </Menu>
    </>
  )
}

export default OrgAdminActionMenu
