import React, {lazy} from 'react'
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg'
import InactivateUserMutation from 'universal/mutations/InactivateUserMutation'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import {BILLING_LEADER, PERSONAL} from 'universal/utils/constants'
import Toggle from 'universal/components/Toggle/Toggle'
import LoadableMenu from 'universal/components/LoadableMenu'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
import {createFragmentContainer, graphql} from 'react-relay'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import LoadableBillingLeaderActionMenu from 'universal/components/LoadableBillingLeaderActionMenu'
import Tooltip from 'universal/components/Tooltip/Tooltip'
import Row from 'universal/components/Row/Row'
import Avatar from 'universal/components/Avatar/Avatar'
import RowInfo from 'universal/components/Row/RowInfo'
import RowInfoHeader from 'universal/components/Row/RowInfoHeader'
import RowInfoHeading from 'universal/components/Row/RowInfoHeading'
import Tag from 'universal/components/Tag/Tag'
import RowInfoLink from 'universal/components/Row/RowInfoLink'
import RowActions from 'universal/components/Row/RowActions'
import {OrgMemberRow_organizationUser} from '__generated__/OrgMemberRow_organizationUser.graphql'
import {OrgMemberRow_organization} from '__generated__/OrgMemberRow_organization.graphql'
import LoadableModal from '../../../../components/LoadableModal'

const originAnchor = {
  vertical: 'top',
  horizontal: 'right'
}

const targetAnchor = {
  vertical: 'top',
  horizontal: 'left'
}

const ActionsBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end'
})

const MenuToggleBlock = styled('div')({
  marginLeft: ui.rowGutter,
  width: '2rem'
})

const ToggleBlock = styled('div')({
  marginLeft: ui.rowGutter,
  width: '6.25rem'
})

interface Props extends WithMutationProps, WithAtmosphereProps {
  billingLeaderCount: number
  organizationUser: OrgMemberRow_organizationUser
  organization: OrgMemberRow_organization
}

const StyledButton = styled(FlatButton)({
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%'
})

const MenuButton = (props) => (
  <StyledButton {...props} disabled={props.disabled}>
    <IconLabel icon='more_vert' />
  </StyledButton>
)

const LeaveOrgModal = lazy(() =>
  import(/* webpackChunkName: 'LeaveOrgModal' */ 'universal/modules/userDashboard/components/LeaveOrgModal/LeaveOrgModal')
)
const OrgMemberRow = (props: Props) => {
  const {
    atmosphere,
    billingLeaderCount,
    submitMutation,
    onError,
    onCompleted,
    organizationUser,
    organization
  } = props
  const {orgId, isViewerBillingLeader, tier} = organization
  const {newUserUntil, user, role} = organizationUser
  const isBillingLeader = role === BILLING_LEADER
  const {email, inactive, picture, preferredName, userId} = user
  const isPersonalTier = tier === PERSONAL
  const isViewerLastBillingLeader =
    isViewerBillingLeader && isBillingLeader && billingLeaderCount === 1
  const {viewerId} = atmosphere

  const toggleHandler = () => {
    if (isPersonalTier) return
    if (!inactive) {
      submitMutation()
      const handleError = (error) => {
        atmosphere.eventEmitter.emit('addToast', {
          level: 'error',
          title: 'Oh no',
          message: error || 'Cannot pause user'
        })
        onError(error)
      }
      InactivateUserMutation(atmosphere, userId, handleError, onCompleted)
    } else {
      atmosphere.eventEmitter.emit('addToast', {
        title: 'We’ve got you covered!',
        message:
          'We’ll reactivate that user the next time they log in so you don’t pay a penny too much',
        level: 'info'
      })
    }
  }
  return (
    <Row>
      <div>
        {picture ? (
          <Avatar hasBadge={false} picture={picture} size='small' />
        ) : (
          <img alt='' src={defaultUserAvatar} />
        )}
      </div>
      <RowInfo>
        <RowInfoHeader>
          <RowInfoHeading>{preferredName}</RowInfoHeading>
          {isBillingLeader && <Tag colorPalette='blue' label='Billing Leader' />}
          {inactive && !isViewerBillingLeader && <Tag colorPalette='midGray' label='Inactive' />}
          {new Date(newUserUntil) > new Date() && <Tag colorPalette='yellow' label='New' />}
        </RowInfoHeader>
        <RowInfoLink href={`mailto:${email}`} title='Send an email'>
          {email}
        </RowInfoLink>
      </RowInfo>
      <RowActions>
        <ActionsBlock>
          {!isBillingLeader && viewerId === userId && (
            <LoadableModal
              LoadableComponent={LeaveOrgModal}
              queryVars={{orgId}}
              toggle={<FlatButton>Leave Organization</FlatButton>}
            />
          )}
          {!isPersonalTier && isViewerBillingLeader && (
            <ToggleBlock>
              <Toggle
                active={!inactive}
                block
                disabled={isPersonalTier}
                label={inactive ? 'Inactive' : 'Active'}
                onClick={toggleHandler}
              />
            </ToggleBlock>
          )}
          {isViewerLastBillingLeader && userId === viewerId && (
            <Tooltip
              tip={
                <div>
                  {'You need to promote another Billing Leader'}
                  <br />
                  {'before you can leave this role or Organization.'}
                </div>
              }
              maxHeight={60}
              maxWidth={200}
              originAnchor={{vertical: 'top', horizontal: 'right'}}
              targetAnchor={{vertical: 'bottom', horizontal: 'right'}}
            >
              <MenuToggleBlock>
                <MenuButton disabled />
              </MenuToggleBlock>
            </Tooltip>
          )}
          {isViewerBillingLeader && !(isViewerLastBillingLeader && userId === viewerId) && (
            <MenuToggleBlock>
              <LoadableMenu
                LoadableComponent={LoadableBillingLeaderActionMenu}
                maxWidth={224}
                maxHeight={200}
                originAnchor={originAnchor}
                queryVars={{
                  isViewerLastBillingLeader,
                  organizationUser,
                  organization
                }}
                targetAnchor={targetAnchor}
                toggle={<MenuButton />}
              />
            </MenuToggleBlock>
          )}
        </ActionsBlock>
      </RowActions>
    </Row>
  )
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(OrgMemberRow)),
  graphql`
    fragment OrgMemberRow_organization on Organization {
      isViewerBillingLeader: isBillingLeader
      orgId: id
      tier
      ...BillingLeaderActionMenu_organization
    }

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
    }
  `
)
