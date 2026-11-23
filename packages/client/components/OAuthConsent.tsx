import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {OAuthAuthorizationRequestInput} from '../__generated__/OAuthAuthorizeQuery.graphql'
import type {OAuthConsent_authorizationRequest$key} from '../__generated__/OAuthConsent_authorizationRequest.graphql'
import type {OAuthConsent_viewer$key} from '../__generated__/OAuthConsent_viewer.graphql'
import useResourceGrants, {isGrantingNothing} from '../hooks/useResourceGrants'
import useScopeSelection from '../hooks/useScopeSelection'
import {TokenScopesTable} from '../modules/userDashboard/components/TokenScopesTable'
import {useCreateOAuthAPICodeMutation} from '../mutations/useCreateOAuthAPICodeMutation'
import {Button} from '../ui/Button/Button'
import isLoopbackHostname from '../utils/isLoopbackHostname'
import getMutationError from '../utils/relay/getMutationError'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import InviteDialog from './InviteDialog'
import OAuthConsentAccess from './OAuthConsentAccess'
import TeamInvitationWrapper from './TeamInvitationWrapper'

interface Props {
  viewerRef: OAuthConsent_viewer$key
  authorizationRequestRef: OAuthConsent_authorizationRequest$key
  request: OAuthAuthorizationRequestInput
}

const OAuthConsent = (props: Props) => {
  const {viewerRef, authorizationRequestRef, request} = props
  const viewer = useFragment(
    graphql`
      fragment OAuthConsent_viewer on User {
        ...OrgTeamGrant_viewer
        email
        organizations {
          id
          teams {
            id
          }
        }
      }
    `,
    viewerRef
  )
  const {name, scopes, redirectUri} = useFragment(
    graphql`
      fragment OAuthConsent_authorizationRequest on OAuthAuthorizationRequest {
        name
        scopes
        redirectUri
      }
    `,
    authorizationRequestRef
  )
  const [createOAuthAPICode, submitting] = useCreateOAuthAPICodeMutation()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLeaving, setIsLeaving] = useState(false)
  const {selectedScopes, toggleScope} = useScopeSelection(scopes)
  const resourceGrants = useResourceGrants()
  const grants = resourceGrants.getGrants(viewer.organizations)
  const canAuthorize = selectedScopes.size > 0 && !isGrantingNothing(grants)
  const redirectUrl = new URL(redirectUri)
  // A framed consent page could be clickjacked, so it only accepts a decision in its own window
  const isFramed = window.self !== window.top

  const authorize = () => {
    setErrorMessage(null)
    createOAuthAPICode({
      variables: {request, scopes: [...selectedScopes], ...grants},
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
    setIsLeaving(true)
    window.location.assign(deniedUrl.toString())
  }

  return (
    <TeamInvitationWrapper>
      <InviteDialog className='w-full max-w-lg'>
        <DialogTitle className='wrap-anywhere'>Authorize {name}</DialogTitle>
        <DialogContent className='flex flex-col gap-5'>
          <div className='flex flex-col gap-2'>
            <p className='wrap-anywhere m-0'>
              <span className='font-semibold'>{name}</span> wants to use your Parabol account,{' '}
              <span className='font-semibold'>{viewer.email}</span>.
            </p>
            <p className='wrap-anywhere m-0 text-fg-secondary'>
              {isLoopbackHostname(redirectUrl.hostname) ? (
                'Whether you authorize it or not, Parabol sends you back to an app on this computer.'
              ) : (
                <>
                  Anyone can register an app under any name, so only continue if you trust{' '}
                  <span className='font-semibold text-fg-primary'>{redirectUrl.host}</span>. Either
                  way, that’s where Parabol sends you next.
                </>
              )}
            </p>
          </div>
          <TokenScopesTable
            selectedScopes={selectedScopes}
            toggleScope={toggleScope}
            availableScopes={new Set(scopes)}
          />
          <OAuthConsentAccess appName={name} viewerRef={viewer} resourceGrants={resourceGrants} />
          {errorMessage && (
            <p role='alert' className='m-0 text-fg-error'>
              {errorMessage}
            </p>
          )}
          {isFramed ? (
            <p className='m-0 font-semibold'>
              To continue, open this page in its own browser window.
            </p>
          ) : (
            <div className='flex justify-end gap-3'>
              <Button variant='outline' size='md' disabled={isLeaving} onClick={cancel}>
                Cancel
              </Button>
              <Button
                variant='primary'
                size='md'
                disabled={!canAuthorize || submitting || isLeaving}
                onClick={authorize}
              >
                Authorize
              </Button>
            </div>
          )}
        </DialogContent>
      </InviteDialog>
    </TeamInvitationWrapper>
  )
}

export default OAuthConsent
