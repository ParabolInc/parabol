import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {useNavigate} from 'react-router'
import type {
  OAuthAuthorizationRequestInput,
  OAuthAuthorizeQuery,
  OAuthScopeEnum
} from '../__generated__/OAuthAuthorizeQuery.graphql'
import useDocumentTitle from '../hooks/useDocumentTitle'
import {useCreateOAuthAPICodeMutation} from '../mutations/useCreateOAuthAPICodeMutation'
import {Button} from '../ui/Button/Button'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import InviteDialog from './InviteDialog'
import TeamInvitationWrapper from './TeamInvitationWrapper'

const SCOPE_DESCRIPTIONS = {
  COMMENTS_READ: 'Read comments',
  COMMENTS_WRITE: 'Create and update comments',
  MEETINGS_READ: 'Read meetings',
  MEETINGS_WRITE: 'Create and update meetings',
  ORGS_READ: 'Read organization details',
  ORGS_WRITE: 'Update organization details',
  PAGES_READ: 'Read pages',
  PAGES_WRITE: 'Create and update pages',
  REPORTS_READ: 'Read reports on people, meetings and tasks',
  REPORTS_WRITE: 'Ask questions on the Reports page',
  TASKS_READ: 'Read tasks',
  TASKS_WRITE: 'Create and update tasks',
  TEAMS_READ: 'Read teams',
  TEAMS_WRITE: 'Create and update teams',
  TEMPLATES_READ: 'Read meeting templates',
  TEMPLATES_WRITE: 'Create and update meeting templates',
  USERS_READ: 'Read your profile',
  USERS_WRITE: 'Update your profile'
} as const satisfies Record<OAuthScopeEnum, string>

const query = graphql`
  query OAuthAuthorizeQuery($request: OAuthAuthorizationRequestInput!) {
    viewer {
      email
      oauthAuthorizationRequest(request: $request) {
        name
        organization {
          name
        }
        scopes
        redirectUri
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
  const navigate = useNavigate()
  const [createOAuthAPICode, submitting] = useCreateOAuthAPICodeMutation()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLeaving, setIsLeaving] = useState(false)
  useDocumentTitle('Authorize App | Parabol', 'Authorize App')
  // A framed consent page could be clickjacked, so it only accepts a decision in its own window
  const isFramed = window.self !== window.top

  if (!oauthAuthorizationRequest) {
    return (
      <TeamInvitationWrapper>
        <InviteDialog className='w-full max-w-md'>
          <DialogTitle>This authorization request isn’t valid</DialogTitle>
          <DialogContent>
            <p className='m-0'>
              Go back to the app that sent you here and try connecting it again.
            </p>
            <div className='flex justify-end pt-6'>
              <Button variant='outline' size='md' onClick={() => navigate('/meetings')}>
                Go to Parabol
              </Button>
            </div>
          </DialogContent>
        </InviteDialog>
      </TeamInvitationWrapper>
    )
  }

  const {name, organization, scopes, redirectUri} = oauthAuthorizationRequest
  const redirectHost = new URL(redirectUri).host

  const authorize = () => {
    setErrorMessage(null)
    createOAuthAPICode({
      variables: {request},
      onCompleted: ({createOAuthAPICode}) => {
        setIsLeaving(true)
        window.location.assign(createOAuthAPICode.redirectUri)
      },
      onError: (error: Error & {source?: {errors?: readonly {message: string}[]}}) => {
        setErrorMessage(error.source?.errors?.[0]?.message ?? error.message)
      }
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
      <InviteDialog className='w-full max-w-md'>
        <DialogTitle className='wrap-anywhere'>Authorize {name}</DialogTitle>
        <DialogContent className='flex flex-col gap-4'>
          <p className='wrap-anywhere m-0'>
            <span className='font-semibold'>{name}</span> wants to use your Parabol account,{' '}
            <span className='font-semibold'>{email}</span>.
          </p>
          <p className='wrap-anywhere m-0 text-fg-secondary'>
            It was registered by {organization.name}, so it can only reach {organization.name}
            ’s teams and pages.
          </p>
          <div>
            <h3 className='m-0 pb-1 font-semibold text-fg-muted text-xs uppercase tracking-wider'>
              It will be able to
            </h3>
            {scopes.length > 0 ? (
              <ul className='m-0 list-disc pl-5'>
                {scopes.map((scope) => (
                  <li key={scope}>{SCOPE_DESCRIPTIONS[scope]}</li>
                ))}
              </ul>
            ) : (
              <p className='m-0'>Nothing yet. It isn’t asking for any permissions.</p>
            )}
          </div>
          <p className='wrap-anywhere m-0 text-fg-secondary'>
            Either way, you’ll be sent to <span className='font-semibold'>{redirectHost}</span>.
          </p>
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
            <div className='flex justify-end gap-3 pt-2'>
              <Button variant='outline' size='md' disabled={isLeaving} onClick={cancel}>
                Cancel
              </Button>
              <Button
                variant='primary'
                size='md'
                disabled={submitting || isLeaving}
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

export default OAuthAuthorize
