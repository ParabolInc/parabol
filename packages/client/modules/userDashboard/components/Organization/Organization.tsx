import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {lazy, useEffect} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import Avatar from '../../../../components/Avatar/Avatar'
import DashNavControl from '../../../../components/DashNavControl/DashNavControl'
import EditableAvatar from '../../../../components/EditableAvatar/EditableAvatar'
import EditableOrgName from '../../../../components/EditableOrgName'
import SettingsWrapper from '../../../../components/Settings/SettingsWrapper'
import useDocumentTitle from '../../../../hooks/useDocumentTitle'
import useModal from '../../../../hooks/useModal'
import useRouter from '../../../../hooks/useRouter'
import {PALETTE} from '../../../../styles/paletteV3'
import defaultOrgAvatar from '../../../../styles/theme/images/avatar-organization.svg'
import {OrganizationQuery} from '../../../../__generated__/OrganizationQuery.graphql'
import BillingMembersToggle from '../BillingMembersToggle/BillingMembersToggle'
import OrgPage from '../OrgBilling/OrgPage'
import UserSettingsWrapper from '../UserSettingsWrapper/UserSettingsWrapper'
import OrganizationDetails from './OrganizationDetails'
import OrganizationPage from './OrganizationPage'

const AvatarAndName = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexShrink: 0,
  margin: '0 auto 16px',
  width: '100%'
})

const OrgNameAndDetails = styled('div')({
  alignItems: 'flex-start',
  color: PALETTE.SLATE_600,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  margin: 'auto 0 auto 16px',
  width: '100%'
})

const BackControlBlock = styled('div')({
  margin: '16px 0'
})

const AvatarBlock = styled('div')({
  width: 64
})

const OrgNameBlock = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 24,
  lineHeight: '36px'
})

const ToggleNavBlock = styled('div')({
  margin: 0
})

const OrgAvatarInput = lazy(
  () => import(/* webpackChunkName: 'OrgAvatarInput' */ '../../../../components/OrgAvatarInput')
)

interface Props {
  queryRef: PreloadedQuery<OrganizationQuery>
}

const query = graphql`
  query OrganizationQuery($orgId: ID!) {
    viewer {
      featureFlags {
        checkoutFlow
      }
      organization(orgId: $orgId) {
        ...OrgPage_organization
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
        featureFlags {
          SAMLUI
        }
      }
    }
  }
`

const Organization = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<OrganizationQuery>(query, queryRef)
  const {viewer} = data
  const {organization, featureFlags: userFeatureFlags} = viewer
  const {history} = useRouter()
  // trying to be somewhere they shouldn't be, using a Redirect borks the loading animation
  useEffect(() => {
    if (!organization) {
      history.replace('/meetings')
    }
  }, [history, organization])
  const {togglePortal, modalPortal} = useModal()
  const orgName = (organization && organization.name) || 'Unknown'
  useDocumentTitle(`Organization Settings | ${orgName}`, orgName)
  if (!organization) return <div />
  const {
    orgId,
    createdAt,
    isBillingLeader,
    picture: orgAvatar,
    tier,
    featureFlags: orgFeatureFlags
  } = organization
  const pictureOrDefault = orgAvatar || defaultOrgAvatar
  const onlyShowMembers = !isBillingLeader && tier !== 'starter'
  const showAuthentication = orgFeatureFlags?.SAMLUI
  const {checkoutFlow} = userFeatureFlags

  if (true) return <OrgPage organizationRef={organization} />
  return (
    <UserSettingsWrapper>
      <SettingsWrapper narrow>
        <BackControlBlock>
          <DashNavControl
            icon='arrow_back'
            label='Back to Organizations'
            onClick={() => history.push('/me/organizations')}
          />
        </BackControlBlock>
        <AvatarAndName>
          {modalPortal(<OrgAvatarInput picture={pictureOrDefault} orgId={orgId} />)}
          {isBillingLeader ? (
            <div onClick={togglePortal}>
              <EditableAvatar hasPanel picture={pictureOrDefault} size={64} unstyled />
            </div>
          ) : (
            <AvatarBlock>
              <Avatar picture={pictureOrDefault} size={64} sansRadius sansShadow />
            </AvatarBlock>
          )}
          <OrgNameAndDetails>
            {isBillingLeader ? (
              <EditableOrgName organization={organization} />
            ) : (
              <OrgNameBlock>{orgName}</OrgNameBlock>
            )}
            <OrganizationDetails createdAt={createdAt} tier={tier} />
          </OrgNameAndDetails>
        </AvatarAndName>
        {!onlyShowMembers && (
          <ToggleNavBlock>
            <BillingMembersToggle orgId={orgId} showAuthentication={showAuthentication} />
          </ToggleNavBlock>
        )}
        <OrganizationPage organization={organization} />
      </SettingsWrapper>
    </UserSettingsWrapper>
  )
}

export default Organization
