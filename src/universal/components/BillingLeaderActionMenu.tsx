import {BillingLeaderActionMenu_organization} from '__generated__/BillingLeaderActionMenu_organization.graphql'
import {BillingLeaderActionMenu_organizationUser} from '__generated__/BillingLeaderActionMenu_organizationUser.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import Menu from 'universal/components/Menu'
import MenuItem from 'universal/components/MenuItem'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import {MenuProps} from 'universal/hooks/useMenu'
import SetOrgUserRoleMutation from 'universal/mutations/SetOrgUserRoleMutation'
import {BILLING_LEADER} from 'universal/utils/constants'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

interface Props extends WithMutationProps, WithAtmosphereProps {
  menuProps: MenuProps
  isViewerLastBillingLeader: boolean
  organizationUser: BillingLeaderActionMenu_organizationUser
  organization: BillingLeaderActionMenu_organization
  toggleLeave: () => void
  toggleRemove: () => void
}

const BillingLeaderActionMenu = (props: Props) => {
  const {
    atmosphere,
    menuProps,
    isViewerLastBillingLeader,
    organizationUser,
    submitting,
    submitMutation,
    onError,
    onCompleted,
    organization,
    toggleLeave,
    toggleRemove
  } = props
  const {orgId} = organization
  const {viewerId} = atmosphere
  const {newUserUntil, role, user} = organizationUser
  const isBillingLeader = role === BILLING_LEADER
  const {id: userId} = user

  const setRole = (role: string | null = null) => () => {
    if (submitting) return
    submitMutation()
    const variables = {orgId, userId, role}
    SetOrgUserRoleMutation(atmosphere, variables, {}, onError, onCompleted)
  }

  return (
    <>
      <Menu ariaLabel={'Select your action'} {...menuProps}>
        {isBillingLeader && !isViewerLastBillingLeader && (
          <MenuItem label='Remove Billing Leader role' onClick={setRole(null)} />
        )}
        {!isBillingLeader && (
          <MenuItem label='Promote to Billing Leader' onClick={setRole(BILLING_LEADER)} />
        )}
        {viewerId === userId && !isViewerLastBillingLeader && (
          <MenuItem label='Leave Organization' onClick={toggleLeave} />
        )}
        {viewerId !== userId && (
          <MenuItem
            label={
              new Date(newUserUntil) > new Date() ? 'Refund and Remove' : 'Remove from Organization'
            }
            onClick={toggleRemove}
          />
        )}
      </Menu>
    </>
  )
}

export default createFragmentContainer(
  withMutationProps(withAtmosphere(BillingLeaderActionMenu)),
  graphql`
    fragment BillingLeaderActionMenu_organization on Organization {
      orgId: id
    }

    fragment BillingLeaderActionMenu_organizationUser on OrganizationUser {
      role
      newUserUntil
      user {
        id
      }
    }
  `
)
