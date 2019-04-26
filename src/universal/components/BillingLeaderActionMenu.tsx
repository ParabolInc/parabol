import {BillingLeaderActionMenu_organization} from '__generated__/BillingLeaderActionMenu_organization.graphql'
import {BillingLeaderActionMenu_organizationUser} from '__generated__/BillingLeaderActionMenu_organizationUser.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import Menu from 'universal/components/Menu'
import MenuItem from 'universal/components/MenuItem'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import useModal from 'universal/hooks/useModal'
import SetOrgUserRoleMutation from 'universal/mutations/SetOrgUserRoleMutation'
import {BILLING_LEADER} from 'universal/utils/constants'
import lazyPreload from 'universal/utils/lazyPreload'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

interface Props extends WithMutationProps, WithAtmosphereProps {
  closePortal: () => void
  isViewerLastBillingLeader: boolean
  organizationUser: BillingLeaderActionMenu_organizationUser
  organization: BillingLeaderActionMenu_organization
}

const LeaveOrgModal = lazyPreload(() =>
  import(/* webpackChunkName: 'LeaveOrgModal' */ 'universal/modules/userDashboard/components/LeaveOrgModal/LeaveOrgModal')
)

const RemoveFromOrgModal = lazyPreload(() =>
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

  const {togglePortal: toggleLeave, modalPortal: leaveModal} = useModal()
  const {togglePortal: toggleRemove, modalPortal: removeModal} = useModal()
  return (
    <>
      <Menu ariaLabel={'Select your action'} closePortal={closePortal}>
        {isBillingLeader && !isViewerLastBillingLeader && (
          <MenuItem label='Remove Billing Leader role' onClick={setRole(null)} />
        )}
        {!isBillingLeader && (
          <MenuItem label='Promote to Billing Leader' onClick={setRole(BILLING_LEADER)} />
        )}
        {viewerId === userId && !isViewerLastBillingLeader && (
          <MenuItem
            noCloseOnClick
            label='Leave Organization'
            onClick={toggleLeave}
            onMouseEnter={LeaveOrgModal.preload}
          />
        )}
        {viewerId !== userId && (
          <MenuItem
            noCloseOnClick
            label={
              new Date(newUserUntil) > new Date() ? 'Refund and Remove' : 'Remove from Organization'
            }
            onClick={toggleRemove}
            onMouseEnter={RemoveFromOrgModal.preload}
          />
        )}
      </Menu>
      {leaveModal(<LeaveOrgModal orgId={orgId} />)}
      {removeModal(
        <RemoveFromOrgModal orgId={orgId} userId={userId} preferredName={preferredName} />
      )}
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
        userId: id
        preferredName
      }
    }
  `
)
