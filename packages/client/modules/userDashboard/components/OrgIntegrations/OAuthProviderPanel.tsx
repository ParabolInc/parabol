import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {OAuthProviderPanelQuery} from '../../../../__generated__/OAuthProviderPanelQuery.graphql'
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
  return <OAuthProviderList organizationRef={organization} />
}

export default OAuthProviderPanel
