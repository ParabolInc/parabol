import React from 'react'
import MenuWithShortcuts from 'universal/components/MenuWithShortcuts'
import MenuItemWithShortcuts from 'universal/components/MenuItemWithShortcuts'
import {BILLING_LEADER} from 'universal/utils/constants'
import SetOrgUserRoleMutation from 'universal/mutations/SetOrgUserRoleMutation'
import LeaveOrgModal from 'universal/modules/userDashboard/components/LeaveOrgModal/LeaveOrgModal'
import RemoveFromOrgModal from 'universal/modules/userDashboard/components/RemoveFromOrgModal/RemoveFromOrgModal'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import type {MutationProps} from 'universal/utils/relay/withMutationProps'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import {BillingLeaderActionMenu_organization as Organization} from '__generated__/BillingLeaderActionMenu_organization.graphql'
import {BillingLeaderActionMenu_orgMember as OrgMember} from '__generated__/BillingLeaderActionMenu_orgMember.graphql'

type Props = {|
  atmosphere: Object,
  closePortal: () => void,
  isViewerLastBillingLeader: boolean,
  orgMember: OrgMember,
  organization: Organization,
  ...MutationProps
|}

const BillingLeaderActionMenu = (props: Props) => {
  const {
    atmosphere,
    closePortal,
    isViewerLastBillingLeader,
    orgMember,
    submitting,
    submitMutation,
    onError,
    onCompleted,
    organization
  } = props
  const {orgId} = organization
  const {viewerId} = atmosphere
  const {isBillingLeader, user} = orgMember
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
          <LeaveOrgModal
            orgId={orgId}
            userId={userId}
            toggle={<MenuItemWithShortcuts label='Leave Organization' />}
          />
        )}
      {viewerId !== userId && (
        <RemoveFromOrgModal
          orgId={orgId}
          preferredName={preferredName}
          userId={userId}
          toggle={<MenuItemWithShortcuts label='Remove from Organization' />}
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

    fragment BillingLeaderActionMenu_orgMember on OrganizationMember {
      isBillingLeader
      user {
        userId: id
        preferredName
      }
    }
  `
)
