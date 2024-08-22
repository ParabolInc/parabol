import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {format} from 'date-fns'
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
import RowActions from '../../../../components/Row/RowActions'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoHeader from '../../../../components/Row/RowInfoHeader'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import RowInfoLink from '../../../../components/Row/RowInfoLink'
import BaseTag from '../../../../components/Tag/BaseTag'
import InactiveTag from '../../../../components/Tag/InactiveTag'
import RoleTag from '../../../../components/Tag/RoleTag'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useModal from '../../../../hooks/useModal'
import defaultUserAvatar from '../../../../styles/theme/images/avatar-user.svg'
import lazyPreload from '../../../../utils/lazyPreload'
import withMutationProps, {WithMutationProps} from '../../../../utils/relay/withMutationProps'

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
  <div className='mr-4 hidden md:block'>
    {picture ? (
      <Avatar picture={picture} className='h-11 w-11' />
    ) : (
      <img alt='default avatar' src={defaultUserAvatar} />
    )}
  </div>
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
  <RowInfo className='pl-0'>
    <RowInfoHeader>
      <RowInfoHeading>{preferredName}</RowInfoHeading>
      {isBillingLeader && <RoleTag>Billing Leader</RoleTag>}
      {isOrgAdmin && <BaseTag className='bg-gold-500 text-white'>Org Admin</BaseTag>}
      {inactive && !isBillingLeader && !isOrgAdmin && <InactiveTag>Inactive</InactiveTag>}
    </RowInfoHeader>
    <RowInfoLink href={`mailto:${email}`} title='Send an email'>
      {email}
    </RowInfoLink>
  </RowInfo>
)

interface LastSeenInfoProps {
  lastSeenAt: string | null
}

const LastSeenInfo: React.FC<LastSeenInfoProps> = ({lastSeenAt}) => {
  const formattedLastSeenAt = lastSeenAt ? format(new Date(lastSeenAt), 'yyyy-MM-dd') : 'Never'

  return <RowInfo className='pl-0'>{formattedLastSeenAt}</RowInfo>
}
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
      <div className='flex items-center justify-end'>
        {showLeaveButton && (
          <StyledFlatButton onClick={toggleLeave} onMouseEnter={LeaveOrgModal.preload}>
            Leave Organization
          </StyledFlatButton>
        )}
        {(isViewerOrgAdmin || (isViewerBillingLeader && !isViewerLastBillingLeader)) && (
          <div className='ml-2 w-8'>
            <MenuButton
              onClick={togglePortal}
              onMouseEnter={
                isViewerOrgAdmin ? OrgAdminActionMenu.preload : BillingLeaderActionMenu.preload
              }
              ref={originRef}
            />
          </div>
        )}
        {isViewerOrgAdmin && menuPortal(<OrgAdminActionMenu {...actionMenuProps} />)}
        {!isViewerOrgAdmin &&
          isViewerBillingLeader &&
          menuPortal(<BillingLeaderActionMenu {...actionMenuProps} />)}
        {leaveModal(<LeaveOrgModal orgId={orgId} />)}
        {removeModal(
          <RemoveFromOrgModal orgId={orgId} userId={userId} preferredName={preferredName} />
        )}
      </div>
    </RowActions>
  )
}

const UserInfoWrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  overflow: 'hidden'
})

const UserInfoContent = styled('div')({
  flexGrow: 1,
  minWidth: 0
})

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
          lastSeenAt
        }
        role
        ...BillingLeaderActionMenu_organizationUser
        ...OrgAdminActionMenu_organizationUser
      }
    `,
    organizationUserRef
  )

  const {isViewerBillingLeader, isViewerOrgAdmin} = organization

  const {
    user: {email, inactive, picture, preferredName, lastSeenAt},
    role
  } = organizationUser

  const {viewerId} = atmosphere

  const isBillingLeader = role === 'BILLING_LEADER'
  const isOrgAdmin = role === 'ORG_ADMIN'
  const isViewerLastBillingLeader =
    isViewerBillingLeader && isBillingLeader && billingLeaderCount === 1
  const isViewerLastOrgAdmin = isViewerOrgAdmin && isOrgAdmin && orgAdminCount === 1

  return (
    <tr className='border-b border-slate-300 last:border-b-0'>
      <td className='w-1/2 py-3 px-2 align-middle'>
        <UserInfoWrapper>
          <UserAvatar picture={picture} />
          <UserInfoContent>
            <UserInfo
              preferredName={preferredName}
              email={email}
              isBillingLeader={isBillingLeader}
              isOrgAdmin={isOrgAdmin}
              inactive={inactive}
            />
          </UserInfoContent>
        </UserInfoWrapper>
      </td>
      <td className='w-3/10 py-3 px-2 align-middle'>
        <LastSeenInfo lastSeenAt={lastSeenAt} />
      </td>
      <td className='w-1/5 py-3 px-2 align-middle'>
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
      </td>
    </tr>
  )
}

export default withMutationProps(OrgMemberRow)
