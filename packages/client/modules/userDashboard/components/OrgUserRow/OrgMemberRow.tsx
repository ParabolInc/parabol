import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {
  OrgMemberRow_organization$data,
  OrgMemberRow_organization$key
} from '../../../../__generated__/OrgMemberRow_organization.graphql'
import {
  OrgMemberRow_organizationUser$data,
  OrgMemberRow_organizationUser$key
} from '../../../../__generated__/OrgMemberRow_organizationUser.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import Row from '../../../../components/Row/Row'
import RowActions from '../../../../components/Row/RowActions'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoHeader from '../../../../components/Row/RowInfoHeader'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import RowInfoLink from '../../../../components/Row/RowInfoLink'
import BaseTag from '../../../../components/Tag/BaseTag'
import InactiveTag from '../../../../components/Tag/InactiveTag'
import RoleTag from '../../../../components/Tag/RoleTag'
import useModal from '../../../../hooks/useModal'
import defaultUserAvatar from '../../../../styles/theme/images/avatar-user.svg'
import {Breakpoint} from '../../../../types/constEnums'
import lazyPreload from '../../../../utils/lazyPreload'

const AvatarBlock = styled('div')({
  display: 'none',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    display: 'block',
    marginRight: 16
  }
})

const StyledRow = styled(Row)({
  padding: '12px 8px 12px 16px',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    padding: '16px 8px 16px 16px'
  }
})

const StyledRowInfo = styled(RowInfo)({
  paddingLeft: 0
})

const ActionsBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end'
})

interface Props {
  organizationUser: OrgMemberRow_organizationUser$key
  organization: OrgMemberRow_organization$key
}

const LeaveOrgModal = lazyPreload(
  () => import(/* webpackChunkName: 'LeaveOrgModal' */ '../LeaveOrgModal/LeaveOrgModal')
)

const OrgAdminActionMenu = lazyPreload(
  () =>
    import(/* webpackChunkName: 'OrgAdminActionMenu' */ '../../../../components/OrgAdminActionMenu')
)

const RemoveFromOrgModal = lazyPreload(
  () =>
    import(/* webpackChunkName: 'RemoveFromOrgModal' */ '../RemoveFromOrgModal/RemoveFromOrgModal')
)

interface UserAvatarProps {
  picture?: string
}

const UserAvatar: React.FC<UserAvatarProps> = ({picture}) => (
  <AvatarBlock>
    {picture ? (
      <Avatar picture={picture} className='h-11 w-11' />
    ) : (
      <img alt='default avatar' src={defaultUserAvatar} />
    )}
  </AvatarBlock>
)

interface UserInfoProps {
  preferredName: string
  email: string
  isBillingLeader: boolean
  isOrgAdmin: boolean
  inactive: boolean | null
}

const UserInfo: React.FC<UserInfoProps> = ({
  preferredName,
  email,
  isBillingLeader,
  isOrgAdmin,
  inactive
}) => (
  <StyledRowInfo>
    <RowInfoHeader>
      <RowInfoHeading>{preferredName}</RowInfoHeading>
      {isBillingLeader && <RoleTag>Billing Leader</RoleTag>}
      {isOrgAdmin && <BaseTag className='bg-gold-500 text-white'>Org Admin</BaseTag>}
      {inactive && !isBillingLeader && !isOrgAdmin && <InactiveTag>Inactive</InactiveTag>}
    </RowInfoHeader>
    <RowInfoLink href={`mailto:${email}`} title='Send an email'>
      {email}
    </RowInfoLink>
  </StyledRowInfo>
)

interface UserActionsProps {
  organization: OrgMemberRow_organization$data
  organizationUser: OrgMemberRow_organizationUser$data
  preferredName: string
}

const UserActions: React.FC<UserActionsProps> = ({
  organizationUser,
  organization,
  preferredName
}) => {
  const {id: orgId} = organization
  const {
    user: {id: userId}
  } = organizationUser
  const {togglePortal: toggleLeave, modalPortal: leaveModal} = useModal()
  const {togglePortal: toggleRemove, modalPortal: removeModal} = useModal()
  return (
    <RowActions>
      <ActionsBlock>
        <OrgAdminActionMenu
          organization={organization}
          organizationUser={organizationUser}
          toggleLeave={toggleLeave}
          toggleRemove={toggleRemove}
        />
        {leaveModal(<LeaveOrgModal orgId={orgId} />)}
        {removeModal(
          <RemoveFromOrgModal orgId={orgId} userId={userId} preferredName={preferredName} />
        )}
      </ActionsBlock>
    </RowActions>
  )
}

const OrgMemberRow = (props: Props) => {
  const {organizationUser: organizationUserRef, organization: organizationRef} = props

  const organization = useFragment(
    graphql`
      fragment OrgMemberRow_organization on Organization {
        id
        ...OrgAdminActionMenu_organization
      }
    `,
    organizationRef
  )

  const organizationUser = useFragment(
    graphql`
      fragment OrgMemberRow_organizationUser on OrganizationUser {
        user {
          id
          email
          inactive
          picture
          preferredName
        }
        role
        ...OrgAdminActionMenu_organizationUser
      }
    `,
    organizationUserRef
  )

  const {
    user: {email, inactive, picture, preferredName},
    role
  } = organizationUser

  const isBillingLeader = role === 'BILLING_LEADER'
  const isOrgAdmin = role === 'ORG_ADMIN'
  return (
    <StyledRow>
      <UserAvatar picture={picture} />
      <UserInfo
        preferredName={preferredName}
        email={email}
        isBillingLeader={isBillingLeader}
        isOrgAdmin={isOrgAdmin}
        inactive={inactive}
      />
      <UserActions
        organizationUser={organizationUser}
        organization={organization}
        preferredName={preferredName}
      />
    </StyledRow>
  )
}

export default OrgMemberRow
