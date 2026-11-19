import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {
  OAuthAuthorizationRequestInput,
  OAuthAuthorizeQuery
} from '../__generated__/OAuthAuthorizeQuery.graphql'
import useDocumentTitle from '../hooks/useDocumentTitle'
import {useCreateOAuthAPICodeMutation} from '../mutations/useCreateOAuthAPICodeMutation'
import getMutationError from '../utils/relay/getMutationError'
import InviteDialog from './InviteDialog'
import OAuthConsentBanner from './OAuthConsent/OAuthConsentBanner'
import OAuthConsentFooter from './OAuthConsent/OAuthConsentFooter'
import OAuthConsentHeader from './OAuthConsent/OAuthConsentHeader'
import OAuthConsentInvalid from './OAuthConsent/OAuthConsentInvalid'
import OAuthConsentOrgPicker from './OAuthConsent/OAuthConsentOrgPicker'
import OAuthConsentPermissions from './OAuthConsent/OAuthConsentPermissions'
import useOAuthConsentChoice from './OAuthConsent/useOAuthConsentChoice'
import TeamInvitationWrapper from './TeamInvitationWrapper'

const query = graphql`
  query OAuthAuthorizeQuery($request: OAuthAuthorizationRequestInput!) {
    viewer {
      email
      oauthAuthorizationRequest(request: $request) {
        ...OAuthConsentHeader_request
        ...OAuthConsentBanner_request
        ...OAuthConsentPermissions_request
        ...OAuthConsentOrgPicker_request
        redirectUri
        organization {
          id
        }
        organizations {
          blockedReason
          organization {
            id
          }
        }
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
  const {email, oauthAuthorizationRequest} = data.viewer
  const allowedOrgIds = (oauthAuthorizationRequest?.organizations ?? [])
    .filter(({blockedReason}) => !blockedReason)
    .map(({organization}) => organization.id)
  const choice = useOAuthConsentChoice(allowedOrgIds)
  const [createOAuthAPICode, submitting] = useCreateOAuthAPICodeMutation()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLeaving, setIsLeaving] = useState(false)
  useDocumentTitle('Authorize App | Parabol', 'Authorize App')

  if (!oauthAuthorizationRequest) return <OAuthConsentInvalid />

  const {redirectUri, organization} = oauthAuthorizationRequest
  const {grantedOrgIds, includePrivate} = choice
  const isNothingChosen = !organization && !includePrivate && grantedOrgIds?.length === 0

  const authorize = () => {
    setErrorMessage(null)
    createOAuthAPICode({
      variables: {request, grantedOrgIds, includePrivate},
      onCompleted: ({createOAuthAPICode}) => {
        setIsLeaving(true)
        window.location.assign(createOAuthAPICode.redirectUri)
      },
      onError: (error) => setErrorMessage(getMutationError(error).message)
    })
  }

  const cancel = () => {
    const deniedUrl = new URL(redirectUri)
    deniedUrl.searchParams.set('error', 'access_denied')
    deniedUrl.searchParams.set('state', request.state)
    deniedUrl.searchParams.set('iss', window.location.origin)
    setIsLeaving(true)
    window.location.assign(deniedUrl.toString())
  }

  return (
    <TeamInvitationWrapper>
      <InviteDialog className='w-[480px] max-w-full gap-5 px-7 pt-7 pb-6'>
        <OAuthConsentHeader requestRef={oauthAuthorizationRequest} email={email} />
        <OAuthConsentBanner requestRef={oauthAuthorizationRequest} />
        <OAuthConsentPermissions requestRef={oauthAuthorizationRequest} />
        <OAuthConsentOrgPicker requestRef={oauthAuthorizationRequest} choice={choice} />
        <OAuthConsentFooter
          canDisconnectInProfile={!organization}
          errorMessage={errorMessage}
          isAllowDisabled={isNothingChosen || submitting || isLeaving}
          isCancelDisabled={isLeaving}
          onAllow={authorize}
          onCancel={cancel}
        />
      </InviteDialog>
    </TeamInvitationWrapper>
  )
}

export default OAuthAuthorize
