import {BillingLeaderActionMenu_organization} from '__generated__/BillingLeaderActionMenu_organization.graphql'
import {BillingLeaderActionMenu_organizationUser} from '__generated__/BillingLeaderActionMenu_organizationUser.graphql'
import React, {lazy} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import MenuItemWithShortcuts from 'universal/components/MenuItemWithShortcuts'
import MenuWithShortcuts from 'universal/components/MenuWithShortcuts'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import SetOrgUserRoleMutation from 'universal/mutations/SetOrgUserRoleMutation'
import {BILLING_LEADER} from 'universal/utils/constants'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import LoadableModal from './LoadableModal'

interface Props extends WithMutationProps, WithAtmosphereProps {
  closePortal: () => void
  isViewerLastBillingLeader: boolean
  organizationUser: BillingLeaderActionMenu_organizationUser
  organization: BillingLeaderActionMenu_organization
}

const LeaveOrgModal = lazy(() =>
  import(/* webpackChunkName: 'LeaveOrgModal' */ 'universal/modules/userDashboard/components/LeaveOrgModal/LeaveOrgModal')
)

const RemoveFromOrgModal = lazy(() =>
  import(/* webpackChunkName: 'RemoveFromOrgModal' */ 'universal/modules/userDashboard/components/RemoveFromOrgModal/RemoveFromOrgModal')
)

const BillingLeaderActionMenu = (props: Props) => {
  const {
    atmosphere,
    closePortal,
    isViewerLastBillingLeader,
    organizationUser,
    submitting,
    submitMutation,
    onError,
    onCompleted,
    organization
  } = props
  const {orgId} = organization
  const {viewerId} = atmosphere
  const {newUserUntil, role, user} = organizationUser
  const isBillingLeader = role === BILLING_LEADER
  const {userId, preferredName} = user

  const setRole = (role = null) => () => {
    if (submitting) return
    submitMutation()
    const variables = {orgId, userId, role}
    SetOrgUserRoleMutation(atmosphere, variables, {}, onError, onCompleted)
  }

  return (
    <MenuWithShortcuts ariaLabel={'Select your action'} closePortal={closePortal}>
      {isBillingLeader &&
        !isViewerLastBillingLeader && (
          <MenuItemWithShortcuts label='Remove Billing Leader role' onClick={setRole(null)} />
        )}
      {!isBillingLeader && (
        <MenuItemWithShortcuts
          label='Promote to Billing Leader'
          onClick={setRole(BILLING_LEADER)}
        />
      )}
      {viewerId === userId &&
        !isViewerLastBillingLeader && (
          <LoadableModal
            LoadableComponent={LeaveOrgModal}
            queryVars={{orgId}}
            toggle={<MenuItemWithShortcuts label='Leave Organization' />}
          />
        )}
      {viewerId !== userId && (
        <LoadableModal
          LoadableComponent={RemoveFromOrgModal}
          queryVars={{orgId, userId, preferredName}}
          toggle={
            <MenuItemWithShortcuts
              label={
                new Date(newUserUntil) > new Date()
                  ? 'Refund and Remove'
                  : 'Remove from Organization'
              }
            />
          }
        />
      )}
    </MenuWithShortcuts>
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
        userId: id
        preferredName
      }
    }
  `
)
