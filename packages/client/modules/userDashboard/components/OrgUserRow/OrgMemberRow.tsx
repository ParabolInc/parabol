import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {forwardRef, Ref} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {
  OrgMemberRow_organization$data,
  OrgMemberRow_organization$key
} from '../../../../__generated__/OrgMemberRow_organization.graphql'
import {
  OrgMemberRow_organizationUser$data,
  OrgMemberRow_organizationUser$key
} from '../../../../__generated__/OrgMemberRow_organizationUser.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import FlatButton, {FlatButtonProps} from '../../../../components/FlatButton'
import IconLabel from '../../../../components/IconLabel'
import Row from '../../../../components/Row/Row'
import RowActions from '../../../../components/Row/RowActions'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoHeader from '../../../../components/Row/RowInfoHeader'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import RowInfoLink from '../../../../components/Row/RowInfoLink'
import BaseTag from '../../../../components/Tag/BaseTag'
import EmphasisTag from '../../../../components/Tag/EmphasisTag'
import InactiveTag from '../../../../components/Tag/InactiveTag'
import RoleTag from '../../../../components/Tag/RoleTag'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useModal from '../../../../hooks/useModal'
import defaultUserAvatar from '../../../../styles/theme/images/avatar-user.svg'
import {Breakpoint} from '../../../../types/constEnums'
import lazyPreload from '../../../../utils/lazyPreload'
import withMutationProps, {WithMutationProps} from '../../../../utils/relay/withMutationProps'

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

const MenuToggleBlock = styled('div')({
  marginLeft: 8,
  width: '2rem'
})

interface Props extends WithMutationProps {
  billingLeaderCount: number
  orgAdminCount: number
  organizationUser: OrgMemberRow_organizationUser$key
  organization: OrgMemberRow_organization$key
}

const StyledButton = styled(FlatButton)({
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%'
})

const StyledFlatButton = styled(FlatButton)({
  paddingLeft: 16,
  paddingRight: 16
})

const MenuButton = forwardRef((props: FlatButtonProps, ref: Ref<HTMLButtonElement>) => (
  <StyledButton {...props} disabled={props.disabled} ref={ref}>
    <IconLabel icon='more_vert' />
  </StyledButton>
))

const LeaveOrgModal = lazyPreload(
  () => import(/* webpackChunkName: 'LeaveOrgModal' */ '../LeaveOrgModal/LeaveOrgModal')
)

const BillingLeaderActionMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'BillingLeaderActionMenu' */ '../../../../components/BillingLeaderActionMenu'
    )
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
  newUserUntil: string
}

const UserInfo: React.FC<UserInfoProps> = ({
  preferredName,
  email,
  isBillingLeader,
  isOrgAdmin,
  inactive,
  newUserUntil
}) => (
  <StyledRowInfo>
    <RowInfoHeader>
      <RowInfoHeading>{preferredName}</RowInfoHeading>
      {isBillingLeader && <RoleTag>Billing Leader</RoleTag>}
      {isOrgAdmin && <BaseTag className='bg-gold-500 text-white'>Org Admin</BaseTag>}
      {inactive && !isBillingLeader && !isOrgAdmin && <InactiveTag>Inactive</InactiveTag>}
      {new Date(newUserUntil) > new Date() && <EmphasisTag>New</EmphasisTag>}
    </RowInfoHeader>
    <RowInfoLink href={`mailto:${email}`} title='Send an email'>
      {email}
    </RowInfoLink>
  </StyledRowInfo>
)

interface UserActionsProps {
  isViewerOrgAdmin: boolean
  isViewerBillingLeader: boolean
  isViewerLastOrgAdmin: boolean
  isViewerLastBillingLeader: boolean
  organization: OrgMemberRow_organization$data
  organizationUser: OrgMemberRow_organizationUser$data
  preferredName: string
  viewerId: string
}

const UserActions: React.FC<UserActionsProps> = ({
  isViewerOrgAdmin,
  isViewerBillingLeader,
  isViewerLastOrgAdmin,
  isViewerLastBillingLeader,
  organizationUser,
  organization,
  preferredName,
  viewerId
}) => {
  const {orgId} = organization
  const {
    user: {userId}
  } = organizationUser
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const {togglePortal: toggleLeave, modalPortal: leaveModal} = useModal()
  const {togglePortal: toggleRemove, modalPortal: removeModal} = useModal()
  const actionMenuProps = {
    menuProps,
    originRef,
    togglePortal,
    toggleLeave,
    toggleRemove,
    isViewerLastOrgAdmin,
    isViewerLastBillingLeader,
    organization,
    organizationUser
  }

  const showLeaveButton = !isViewerOrgAdmin && !isViewerBillingLeader && viewerId === userId

  return (
    <RowActions>
      <ActionsBlock>
        {showLeaveButton && (
          <StyledFlatButton onClick={toggleLeave} onMouseEnter={LeaveOrgModal.preload}>
            Leave Organization
          </StyledFlatButton>
        )}
        {(isViewerOrgAdmin || (isViewerBillingLeader && !isViewerLastBillingLeader)) && (
          <MenuToggleBlock>
            <MenuButton
              onClick={togglePortal}
              onMouseEnter={
                isViewerOrgAdmin ? OrgAdminActionMenu.preload : BillingLeaderActionMenu.preload
              }
              ref={originRef}
            />
          </MenuToggleBlock>
        )}
        {isViewerOrgAdmin && menuPortal(<OrgAdminActionMenu {...actionMenuProps} />)}
        {!isViewerOrgAdmin &&
          isViewerBillingLeader &&
          menuPortal(<BillingLeaderActionMenu {...actionMenuProps} />)}
        {leaveModal(<LeaveOrgModal orgId={orgId} />)}
        {removeModal(
          <RemoveFromOrgModal orgId={orgId} userId={userId} preferredName={preferredName} />
        )}
      </ActionsBlock>
    </RowActions>
  )
}

const OrgMemberRow = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {
    billingLeaderCount,
    orgAdminCount,
    organizationUser: organizationUserRef,
    organization: organizationRef
  } = props

  const organization = useFragment(
    graphql`
      fragment OrgMemberRow_organization on Organization {
        isViewerBillingLeader: isBillingLeader
        isViewerOrgAdmin: isOrgAdmin
        orgId: id
        ...BillingLeaderActionMenu_organization
        ...OrgAdminActionMenu_organization
      }
    `,
    organizationRef
  )

  const organizationUser = useFragment(
    graphql`
      fragment OrgMemberRow_organizationUser on OrganizationUser {
        user {
          userId: id
          email
          inactive
          picture
          preferredName
        }
        role
        newUserUntil
        ...BillingLeaderActionMenu_organizationUser
        ...OrgAdminActionMenu_organizationUser
      }
    `,
    organizationUserRef
  )

  const {isViewerBillingLeader, isViewerOrgAdmin} = organization

  const {
    newUserUntil,
    user: {email, inactive, picture, preferredName},
    role
  } = organizationUser

  const {viewerId} = atmosphere

  const isBillingLeader = role === 'BILLING_LEADER'
  const isOrgAdmin = role === 'ORG_ADMIN'
  const isViewerLastBillingLeader =
    isViewerBillingLeader && isBillingLeader && billingLeaderCount === 1
  const isViewerLastOrgAdmin = isViewerOrgAdmin && isOrgAdmin && orgAdminCount === 1

  return (
    <StyledRow>
      <UserAvatar picture={picture} />
      <UserInfo
        preferredName={preferredName}
        email={email}
        isBillingLeader={isBillingLeader}
        isOrgAdmin={isOrgAdmin}
        inactive={inactive}
        newUserUntil={newUserUntil}
      />
      <UserActions
        isViewerOrgAdmin={isViewerOrgAdmin}
        isViewerBillingLeader={isViewerBillingLeader}
        isViewerLastOrgAdmin={isViewerLastOrgAdmin}
        isViewerLastBillingLeader={isViewerLastBillingLeader}
        organizationUser={organizationUser}
        organization={organization}
        preferredName={preferredName}
        viewerId={viewerId}
      />
    </StyledRow>
  )
}

export default withMutationProps(OrgMemberRow)
