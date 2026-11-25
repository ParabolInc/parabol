import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {
  OAuthAuthorizationRequestInput,
  OAuthAuthorizeQuery
} from '../__generated__/OAuthAuthorizeQuery.graphql'
import useDocumentTitle from '../hooks/useDocumentTitle'
import OAuthAuthorizeInvalid from './OAuthAuthorizeInvalid'
import OAuthConsent from './OAuthConsent'

const query = graphql`
  query OAuthAuthorizeQuery($request: OAuthAuthorizationRequestInput!) {
    viewer {
      ...OAuthConsent_viewer
      oauthAuthorizationRequest(request: $request) {
        ...OAuthConsent_authorizationRequest
      }
    }
  }
`

interface Props {
  queryRef: PreloadedQuery<OAuthAuthorizeQuery>
  request: OAuthAuthorizationRequestInput
}

const OAuthAuthorize = (props: Props) => {
  const {queryRef, request} = props
  const data = usePreloadedQuery<OAuthAuthorizeQuery>(query, queryRef)
  const {viewer} = data
  useDocumentTitle('Authorize App | Parabol', 'Authorize App')
  if (!viewer.oauthAuthorizationRequest) return <OAuthAuthorizeInvalid />
  return (
    <OAuthConsent
      viewerRef={viewer}
      authorizationRequestRef={viewer.oauthAuthorizationRequest}
      request={request}
    />
  )
}

export default OAuthAuthorize
