import {Organization_viewer} from '../../../../__generated__/Organization_viewer.graphql'
import React, {lazy, useEffect} from 'react'
import styled from '@emotion/styled'
import Helmet from 'react-helmet'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import Avatar from '../../../../components/Avatar/Avatar'
import DashNavControl from '../../../../components/DashNavControl/DashNavControl'
import EditableAvatar from '../../../../components/EditableAvatar/EditableAvatar'
import EditableOrgName from '../../../../components/EditableOrgName'
import LoadableModal from '../../../../components/LoadableModal'
import SettingsWrapper from '../../../../components/Settings/SettingsWrapper'
import BillingMembersToggle from '../BillingMembersToggle/BillingMembersToggle'
import UserSettingsWrapper from '../UserSettingsWrapper/UserSettingsWrapper'
import appTheme from '../../../../styles/theme/appTheme'
import defaultOrgAvatar from '../../../../styles/theme/images/avatar-organization.svg'
import ui from '../../../../styles/ui'
import {PERSONAL} from '../../../../utils/constants'
import OrganizationDetails from './OrganizationDetails'
import OrganizationPage from './OrganizationPage'

const AvatarAndName = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexShrink: 0,
  margin: '0 0 1rem',
  width: '100%'
})

const OrgNameAndDetails = styled('div')({
  color: appTheme.palette.mid,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  marginLeft: '1.5rem',
  width: '100%'
})

const BackControlBlock = styled('div')({
  margin: '1rem 0'
})

const AvatarBlock = styled('div')({
  display: 'block',
  margin: '1.5rem auto',
  width: '6rem'
})

const OrgNameBlock = styled('div')({
  color: ui.colorText,
  fontSize: appTheme.typography.s7,
  lineHeight: appTheme.typography.s8,
  placeholderColor: ui.placeholderColor
})

const OrgAvatarInput = lazy(() =>
  import(/* webpackChunkName: 'OrgAvatarInput' */ '../../../../components/OrgAvatarInput')
)

interface Props extends RouteComponentProps<{}> {
  viewer: Organization_viewer
}

const Organization = (props: Props) => {
  const {
    history,
    viewer: {organization}
  } = props
  // trying to be somewhere they shouldn't be, using a Redirect borks the loading animation
  useEffect(() => {
    if (!organization) {
      history.replace('/me')
    }
  }, [history, organization])
  if (!organization) return <div />
  const {orgId, createdAt, isBillingLeader, name: orgName, picture: orgAvatar, tier} = organization
  const pictureOrDefault = orgAvatar || defaultOrgAvatar
  const onlyShowMembers = !isBillingLeader && tier !== PERSONAL

  return (
    <UserSettingsWrapper>
      <Helmet title={`Organization Settings | ${orgName}`} />
      <SettingsWrapper narrow>
        <BackControlBlock>
          <DashNavControl
            icon='arrow_back'
            label='Back to Organizations'
            onClick={() => history.push('/me/organizations')}
          />
        </BackControlBlock>
        <AvatarAndName>
          {isBillingLeader ? (
            <LoadableModal
              isToggleNativeElement
              LoadableComponent={OrgAvatarInput}
              queryVars={{picture: pictureOrDefault, orgId}}
              toggle={
                <div>
                  <EditableAvatar hasPanel picture={pictureOrDefault} size={96} unstyled />
                </div>
              }
            />
          ) : (
            <AvatarBlock>
              <Avatar picture={pictureOrDefault} size={96} sansRadius sansShadow />
            </AvatarBlock>
          )}
          <OrgNameAndDetails>
            {isBillingLeader ? (
              <EditableOrgName organization={organization} />
            ) : (
              <OrgNameBlock>{orgName}</OrgNameBlock>
            )}
            <OrganizationDetails createdAt={createdAt} tier={tier} />
            {!onlyShowMembers && <BillingMembersToggle orgId={orgId} />}
          </OrgNameAndDetails>
        </AvatarAndName>
        <OrganizationPage organization={organization} />
      </SettingsWrapper>
    </UserSettingsWrapper>
  )
}

export default createFragmentContainer(withRouter(Organization), {
  viewer: graphql`
    fragment Organization_viewer on User {
      organization(orgId: $orgId) {
        ...EditableOrgName_organization
        ...OrganizationPage_organization
        orgId: id
        isBillingLeader
        createdAt
        name
        orgUserCount {
          activeUserCount
          inactiveUserCount
        }
        picture
        creditCard {
          brand
          expiry
          last4
        }
        periodStart
        periodEnd
        tier
      }
    }
  `
})
