import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {useFragment} from 'react-relay'
import OrgAvatarInput from '../../../../components/OrgAvatarInput'
import useModal from '../../../../hooks/useModal'
import {OrgDetails_organization$key} from '../../../../__generated__/OrgDetails_organization.graphql'
import OrgBillingDangerZone from './OrgBillingDangerZone'
import defaultOrgAvatar from '../../../../styles/theme/images/avatar-organization.svg'
import EditableOrgName from '../../../../components/EditableOrgName'
import OrganizationDetails from '../Organization/OrganizationDetails'
import Avatar from '../../../../components/Avatar/Avatar'
import EditableAvatar from '../../../../components/EditableAvatar/EditableAvatar'

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
      }
    `,
    organizationRef
  )
  const {orgId, createdAt, isBillingLeader, picture: orgAvatar, name, tier} = organization
  const pictureOrDefault = orgAvatar ?? defaultOrgAvatar
  const orgName = name ?? 'Unknown'
  const {togglePortal, modalPortal} = useModal()

  return (
    <Suspense fallback={''}>
      <div className='mb-4 flex w-full items-center'>
        {modalPortal(<OrgAvatarInput picture={pictureOrDefault} orgId={orgId} />)}
        {isBillingLeader ? (
          <div onClick={togglePortal} className='mr-2'>
            <EditableAvatar hasPanel picture={pictureOrDefault} size={64} unstyled />
          </div>
        ) : (
          <div className='mr-4 w-16'>
            <Avatar picture={pictureOrDefault} size={64} sansRadius sansShadow />
          </div>
        )}
        <div className='text-gray-600 ml-2 flex flex-grow flex-col items-start'>
          {isBillingLeader ? (
            <EditableOrgName organization={organization} />
          ) : (
            <div className='text-gray-700 text-2xl leading-9'>{orgName}</div>
          )}
          <OrganizationDetails createdAt={createdAt} tier={tier} />
        </div>
      </div>
      <OrgBillingDangerZone organization={organization} isWide />
    </Suspense>
  )
}

export default OrgDetails
