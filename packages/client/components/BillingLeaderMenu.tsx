import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import SetOrgUserRoleMutation from '../mutations/SetOrgUserRoleMutation'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import {BillingLeaderActionMenu_organization$key} from '../__generated__/BillingLeaderActionMenu_organization.graphql'
import {BillingLeaderMenu_user$key} from '../__generated__/ BillingLeaderMenu_user.graphql'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props extends WithMutationProps {
  menuProps: MenuProps
  // isViewerLastBillingLeader: boolean
  billingLeaderRef: BillingLeaderMenu_user$key
  billingLeaderCount: number
  // organization: BillingLeaderActionMenu_organization$key
  // toggleLeave: () => void
  // toggleRemove: () => void
}

const BillingLeaderMenu = (props: Props) => {
  const {
    menuProps,
    billingLeaderRef,
    billingLeaderCount
    // isViewerLastBillingLeader,
    // organizationUser: organizationUserRef,
    // submitting,
    // submitMutation,
    // onError,
    // onCompleted,
    // organization: organizationRef,
    // toggleLeave,
    // toggleRemove
  } = props
  // const organization = useFragment(
  //   graphql`
  //     fragment BillingLeaderMenu_organization on Organization {
  //       id
  //       tier
  //     }
  //   `,
  //   organizationRef
  // )
  // const organizationUser = useFragment(
  //   graphql`
  //     fragment BillingLeaderMenu_organizationUser on OrganizationUser {
  //       role
  //       newUserUntil
  //       user {
  //         id
  //       }
  //     }
  //   `,
  //   organizationUserRef
  // )
  const atmosphere = useAtmosphere()
  const billingLeader = useFragment(
    graphql`
      fragment BillingLeaderMenu_user on User {
        id
        organizationUser(orgId: $orgId) {
          id
          newUserUntil
          tier
        }
      }
    `,
    billingLeaderRef
  )
  // const {id: orgId, tier} = organization
  const {viewerId} = atmosphere
  const {id: userId, organizationUser} = billingLeader
  console.log('🚀 ~ billingLeader:', billingLeader)
  const {newUserUntil, tier} = organizationUser
  const isViewer = viewerId === userId
  const isViewerLastBillingLeader = isViewer && billingLeaderCount === 1

  const setRole =
    (role: string | null = null) =>
    () => {
      // if (submitting) return
      // submitMutation()
      // const variables = {orgId, userId, role}
      // SetOrgUserRoleMutation(atmosphere, variables, {onError, onCompleted})
    }

  return (
    <>
      <Menu ariaLabel={'Select your action'} {...menuProps}>
        <MenuItem label='Remove Billing Leader role' onClick={setRole(null)} />
        {isViewer && <MenuItem label='Leave Organization' />}
        {!isViewer && (
          <MenuItem
            label={
              tier === 'team' && new Date(newUserUntil) > new Date()
                ? 'Refund and Remove'
                : 'Remove from Organization'
            }
            // onClick={toggleRemove}
          />
        )}
      </Menu>
    </>
  )
}

export default BillingLeaderMenu
