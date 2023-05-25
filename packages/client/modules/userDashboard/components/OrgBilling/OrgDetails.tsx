import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {useFragment} from 'react-relay'
import OrgAvatarInput from '../../../../components/OrgAvatarInput'
import useModal from '../../../../hooks/useModal'
import {PALETTE} from '../../../../styles/paletteV3'
import {OrgDetails_organization$key} from '../../../../__generated__/OrgDetails_organization.graphql'
import OrgBillingDangerZone from './OrgBillingDangerZone'
import defaultOrgAvatar from '../../../../styles/theme/images/avatar-organization.svg'
import EditableOrgName from '../../../../components/EditableOrgName'
import OrganizationDetails from '../Organization/OrganizationDetails'
import Avatar from '../../../../components/Avatar/Avatar'
import EditableAvatar from '../../../../components/EditableAvatar/EditableAvatar'

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

const AvatarBlock = styled('div')({
  width: 64
})

const OrgNameBlock = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 24,
  lineHeight: '36px'
})

type Props = {
  organizationRef: OrgDetails_organization$key
}

const OrgDetails = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgDetails_organization on Organization {
        ...OrgBillingDangerZone_organization
        ...EditableOrgName_organization
        orgId: id
        isBillingLeader
        createdAt
        picture
        tier
        name
        featureFlags {
          SAMLUI
        }
      }
    `,
    organizationRef
  )
  const {orgId, createdAt, isBillingLeader, picture: orgAvatar, name, tier} = organization
  const pictureOrDefault = orgAvatar || defaultOrgAvatar
  const orgName = name ?? 'Unknown'
  const {togglePortal, modalPortal} = useModal()

  return (
    <Suspense fallback={''}>
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
      <OrgBillingDangerZone organization={organization} />
    </Suspense>
  )
}

export default OrgDetails
