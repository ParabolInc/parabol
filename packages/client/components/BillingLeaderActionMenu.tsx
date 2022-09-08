import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import SetOrgUserRoleMutation from '../mutations/SetOrgUserRoleMutation'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import {BillingLeaderActionMenu_organization} from '../__generated__/BillingLeaderActionMenu_organization.graphql'
import {BillingLeaderActionMenu_organizationUser} from '../__generated__/BillingLeaderActionMenu_organizationUser.graphql'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props extends WithMutationProps {
  menuProps: MenuProps
  isViewerLastBillingLeader: boolean
  organizationUser: BillingLeaderActionMenu_organizationUser
  organization: BillingLeaderActionMenu_organization
  toggleLeave: () => void
  toggleRemove: () => void
}

const BillingLeaderActionMenu = (props: Props) => {
  const {
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

  const {t} = useTranslation()

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
      SetOrgUserRoleMutation(atmosphere, variables, {}, onError, onCompleted)
    }

  return (
    <>
      <Menu ariaLabel={t('BillingLeaderActionMenu.SelectYourAction')} {...menuProps}>
        {isBillingLeader && !isViewerLastBillingLeader && (
          <MenuItem
            label={t('BillingLeaderActionMenu.RemoveBillingLeaderRole')}
            onClick={setRole(null)}
          />
        )}
        {!isBillingLeader && (
          <MenuItem
            label={t('BillingLeaderActionMenu.PromoteToBillingLeader')}
            onClick={setRole('BILLING_LEADER')}
          />
        )}
        {viewerId === userId && !isViewerLastBillingLeader && (
          <MenuItem label={t('BillingLeaderActionMenu.LeaveOrganization')} onClick={toggleLeave} />
        )}
        {viewerId !== userId && (
          <MenuItem
            label={
              tier === 'pro' && new Date(newUserUntil) > new Date()
                ? t('BillingLeaderActionMenu.RefundAndRemove')
                : t('BillingLeaderActionMenu.RemoveFromOrganization')
            }
            onClick={toggleRemove}
          />
        )}
      </Menu>
    </>
  )
}

export default createFragmentContainer(withMutationProps(BillingLeaderActionMenu), {
  organization: graphql`
    fragment BillingLeaderActionMenu_organization on Organization {
      id
      tier
    }
  `,
  organizationUser: graphql`
    fragment BillingLeaderActionMenu_organizationUser on OrganizationUser {
      role
      newUserUntil
      user {
        id
      }
    }
  `
})
