import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import {OrgDetails_organization$key} from '../../../../__generated__/OrgDetails_organization.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import EditableAvatar from '../../../../components/EditableAvatar/EditableAvatar'
import EditableOrgName from '../../../../components/EditableOrgName'
import OrgAvatarInput from '../../../../components/OrgAvatarInput'
import useModal from '../../../../hooks/useModal'
import defaultOrgAvatar from '../../../../styles/theme/images/avatar-organization.svg'
import OrganizationDetails from '../Organization/OrganizationDetails'
import OrgBillingDangerZone from './OrgBillingDangerZone'
import OrgFeatureFlags from './OrgFeatureFlags'
import OrgFeatures from './OrgFeatures'

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
        ...OrgFeatureFlags_organization
        ...OrgFeatures_organization
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
        <div className='text-gray-600 ml-6 flex grow flex-col items-start'>
          {isBillingLeader ? (
            <EditableOrgName organization={organization} />
          ) : (
            <div className='text-gray-700 text-2xl leading-9'>{orgName}</div>
          )}
          <OrganizationDetails createdAt={createdAt} billingTier={billingTier} tier={tier} />
        </div>
      </div>

      <OrgFeatures organizationRef={organization} />
      <OrgFeatureFlags organizationRef={organization} />
      <OrgBillingDangerZone organization={organization} isWide />
    </Suspense>
  )
}

export default OrgDetails
