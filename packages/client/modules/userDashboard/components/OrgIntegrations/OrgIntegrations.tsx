import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {useFragment} from 'react-relay'
import {OrgIntegrations_organization$key} from '../../../../__generated__/OrgIntegrations_organization.graphql'
import {Loader} from '../../../../utils/relay/renderLoader'
import GitLabProviderRow from './GitLabProviderRow'

type Props = {
  organizationRef: OrgIntegrations_organization$key
}

const OrgIntegrations = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgIntegrations_organization on Organization {
        id
        ...GitLabProviderRow_organization
        createdAt
        tier
      }
    `,
    organizationRef
  )

  return (
    <Suspense fallback={<Loader />}>
      <div className='flex w-full flex-wrap px-4'>
        <div className='w-[768px] max-w-[768px]'>
          <h1>Integration Settings</h1>
          <div className='text-base text-slate-700'>
            Configure organization-level integrations that can be used by teams across your
            organization.
            <br />
            See the team integration tab for team-level connections.
          </div>
          <GitLabProviderRow organizationRef={organization} />
        </div>
      </div>
    </Suspense>
  )
}

export default OrgIntegrations
