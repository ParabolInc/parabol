import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Suspense, useState} from 'react'
import {useFragment} from 'react-relay'
import {OrgDetails_organization$key} from '../../../../__generated__/OrgDetails_organization.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import EditableAvatar from '../../../../components/EditableAvatar/EditableAvatar'
import EditableOrgName from '../../../../components/EditableOrgName'
import OrgAvatarInput from '../../../../components/OrgAvatarInput'
import Panel from '../../../../components/Panel/Panel'
import Toggle from '../../../../components/Toggle/Toggle'
import useModal from '../../../../hooks/useModal'
import {PALETTE} from '../../../../styles/paletteV3'
import defaultOrgAvatar from '../../../../styles/theme/images/avatar-organization.svg'
import {ElementWidth, Layout} from '../../../../types/constEnums'
import OrganizationDetails from '../Organization/OrganizationDetails'
import OrgBillingDangerZone from './OrgBillingDangerZone'
import OrgFeatures from './OrgFeatures'

type Props = {
  organizationRef: OrgDetails_organization$key
}

const StyledPanel = styled(Panel)<{isWide: boolean}>(({isWide}) => ({
  maxWidth: isWide ? ElementWidth.PANEL_WIDTH : 'inherit'
}))

const PanelRow = styled('div')({
  borderTop: `1px solid ${PALETTE.SLATE_300}`,
  padding: Layout.ROW_GUTTER
})

const FeatureRow = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8
})

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
        billingTier
        tier
        name
      }
    `,
    organizationRef
  )
  const {
    orgId,
    createdAt,
    isBillingLeader,
    picture: orgAvatar,
    name,
    billingTier,
    tier
  } = organization
  const pictureOrDefault = orgAvatar ?? defaultOrgAvatar
  const orgName = name ?? 'Unknown'
  const {togglePortal, modalPortal} = useModal()

  // Add state for toggles
  const [showAIFeatures, setShowAIFeatures] = useState(false)
  const [suggestGroups, setSuggestGroups] = useState(false)
  const [publicTeams, setPublicTeams] = useState(false)
  const [standUpAISummary, setStandUpAISummary] = useState(false)
  const [relatedDiscussions, setRelatedDiscussions] = useState(false)

  return (
    <Suspense fallback={''}>
      <div className='mb-4 flex w-full items-center'>
        {modalPortal(<OrgAvatarInput picture={pictureOrDefault} orgId={orgId} />)}
        {isBillingLeader ? (
          <EditableAvatar onClick={togglePortal} picture={pictureOrDefault} className='h-16 w-16' />
        ) : (
          <div className='w-16'>
            <Avatar picture={pictureOrDefault} />
          </div>
        )}
        <div className='text-gray-600 ml-6 flex flex-grow flex-col items-start'>
          {isBillingLeader ? (
            <EditableOrgName organization={organization} />
          ) : (
            <div className='text-gray-700 text-2xl leading-9'>{orgName}</div>
          )}
          <OrganizationDetails createdAt={createdAt} billingTier={billingTier} tier={tier} />
        </div>
      </div>

      {/* <StyledPanel isWide label='AI Features'>
        <PanelRow>
          <FeatureRow>
            <span>Show AI Features</span>
            <Toggle active={showAIFeatures} onClick={() => setShowAIFeatures(!showAIFeatures)} />
          </FeatureRow>
        </PanelRow>
      </StyledPanel> */}
      <OrgFeatures />

      <StyledPanel isWide label='Organization Feature Flags'>
        <PanelRow>
          <FeatureRow>
            <span>Suggest Groups</span>
            <Toggle active={suggestGroups} onClick={() => setSuggestGroups(!suggestGroups)} />
          </FeatureRow>
          <FeatureRow>
            <span>Public Teams</span>
            <Toggle active={publicTeams} onClick={() => setPublicTeams(!publicTeams)} />
          </FeatureRow>
          <FeatureRow>
            <span>StandUp AI Summary</span>
            <Toggle
              active={standUpAISummary}
              onClick={() => setStandUpAISummary(!standUpAISummary)}
            />
          </FeatureRow>
          <FeatureRow>
            <span>Related Discussions</span>
            <Toggle
              active={relatedDiscussions}
              onClick={() => setRelatedDiscussions(!relatedDiscussions)}
            />
          </FeatureRow>
        </PanelRow>
      </StyledPanel>

      <OrgBillingDangerZone organization={organization} isWide />
    </Suspense>
  )
}

export default OrgDetails
