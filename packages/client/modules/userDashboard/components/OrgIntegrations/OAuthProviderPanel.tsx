import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {OAuthProviderPanelQuery} from '../../../../__generated__/OAuthProviderPanelQuery.graphql'
import LabelHeading from '../../../../components/LabelHeading/LabelHeading'
import Panel from '../../../../components/Panel/Panel'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import OAuthProviderList from './OAuthProviderList'

const query = graphql`
  query OAuthProviderPanelQuery($orgId: ID!) {
    viewer {
      organization(orgId: $orgId) {
        ...OAuthProviderList_organization
      }
    }
  }
`

const OAuthProviderPanelContent = ({
  queryRef
}: {
  queryRef: PreloadedQuery<OAuthProviderPanelQuery>
}) => {
  const data = usePreloadedQuery<OAuthProviderPanelQuery>(query, queryRef)
  const {organization} = data.viewer
  if (!organization) return null
  return (
    <Panel className='max-w-[976px]'>
      <LabelHeading className='px-6 pt-4 pb-2'>OAuth 2.0 API</LabelHeading>
      <div className='border-hairline border-t px-6 pt-6 pb-6'>
        <div className='mb-6 text-base text-fg-primary'>
          Configure your organization as an OAuth 2.0 provider to allow external applications to
          authenticate with your Parabol organization.
        </div>
        <OAuthProviderList organizationRef={organization} />
      </div>
    </Panel>
  )
}

const OAuthProviderPanel = ({orgId}: {orgId: string}) => {
  const queryRef = useQueryLoaderNow<OAuthProviderPanelQuery>(query, {orgId})
  return (
    <Suspense fallback={''}>
      {queryRef && <OAuthProviderPanelContent queryRef={queryRef} />}
    </Suspense>
  )
}

export default OAuthProviderPanel
