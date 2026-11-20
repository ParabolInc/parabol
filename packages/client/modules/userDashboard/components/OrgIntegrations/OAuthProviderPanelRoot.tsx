import {Suspense} from 'react'
import oAuthProviderPanelQuery, {
  type OAuthProviderPanelQuery
} from '../../../../__generated__/OAuthProviderPanelQuery.graphql'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import OAuthProviderPanel from './OAuthProviderPanel'

interface Props {
  orgId: string
}

const OAuthProviderPanelRoot = (props: Props) => {
  const {orgId} = props
  const queryRef = useQueryLoaderNow<OAuthProviderPanelQuery>(oAuthProviderPanelQuery, {orgId})
  return <Suspense fallback={''}>{queryRef && <OAuthProviderPanel queryRef={queryRef} />}</Suspense>
}

export default OAuthProviderPanelRoot
