import {Suspense} from 'react'
import oAuthAuthorizeQuery, {
  type OAuthAuthorizeQuery
} from '../__generated__/OAuthAuthorizeQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import {LoaderSize} from '../types/constEnums'
import {Loader} from '../utils/relay/renderLoader'
import OAuthAuthorize from './OAuthAuthorize'

const OAuthAuthorizeRoot = () => {
  const searchParams = new URLSearchParams(location.search)
  const request = {
    clientId: searchParams.get('client_id') ?? '',
    redirectUri: searchParams.get('redirect_uri') ?? '',
    scope: searchParams.get('scope'),
    state: searchParams.get('state') ?? '',
    codeChallenge: searchParams.get('code_challenge'),
    codeChallengeMethod: searchParams.get('code_challenge_method')
  }
  const queryRef = useQueryLoaderNow<OAuthAuthorizeQuery>(
    oAuthAuthorizeQuery,
    {request},
    'network-only'
  )
  return (
    <Suspense fallback={<Loader size={LoaderSize.WHOLE_PAGE} />}>
      {queryRef && <OAuthAuthorize queryRef={queryRef} request={request} />}
    </Suspense>
  )
}

export default OAuthAuthorizeRoot
