import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import type {OAuthProviderSettings_organization$key} from '../../../../__generated__/OAuthProviderSettings_organization.graphql'
import {Loader} from '../../../../utils/relay/renderLoader'
import OAuthIntegration from './OAuthIntegration'

type Props = {
  organizationRef: OAuthProviderSettings_organization$key
}

const OAuthProviderSettings = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OAuthProviderSettings_organization on Organization {
        ...OAuthIntegration_organization
      }
    `,
    organizationRef
  )

  return (
    <Suspense fallback={<Loader />}>
      <div className='flex w-full flex-wrap'>
        <div className='w-[768px] max-w-[768px]'>
          <h1>OAuth 2.0 Provider</h1>
          <div className='mb-6 text-base text-slate-700'>
            Configure your organization as an OAuth 2.0 provider to allow external applications to
            authenticate with your Parabol organization.
          </div>
          <OAuthIntegration organizationRef={organization} />
        </div>
      </div>
    </Suspense>
  )
}

export default OAuthProviderSettings
