import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {OAuthProviderPanelQuery} from '../../../../__generated__/OAuthProviderPanelQuery.graphql'
import LabelHeading from '../../../../components/LabelHeading/LabelHeading'
import Panel from '../../../../components/Panel/Panel'
import OAuthProviderList from './OAuthProviderList'

interface Props {
  queryRef: PreloadedQuery<OAuthProviderPanelQuery>
}

const OAuthProviderPanel = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<OAuthProviderPanelQuery>(
    graphql`
      query OAuthProviderPanelQuery($orgId: ID!) {
        viewer {
          organization(orgId: $orgId) {
            ...OAuthProviderList_organization
          }
        }
      }
    `,
    queryRef
  )
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

export default OAuthProviderPanel
