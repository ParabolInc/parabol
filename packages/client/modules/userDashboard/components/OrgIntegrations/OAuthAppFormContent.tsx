import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useMutation} from 'react-relay'
import type {OAuthAppFormContentCreateMutation} from '../../../../__generated__/OAuthAppFormContentCreateMutation.graphql'
import ErrorAlert from '../../../../components/ErrorAlert/ErrorAlert'
import BasicInput from '../../../../components/InputField/BasicInput'
import SecondaryButton from '../../../../components/SecondaryButton'
import {cn} from '../../../../ui/cn'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'
import makeAppURL from '../../../../utils/makeAppURL'
import OAuthScopePicker from './OAuthScopePicker'

export interface FormContentProps {
  orgId: string
  isNew: boolean
  initialData?: any
  onClose: () => void
}

const OAuthAppFormContent = ({orgId, isNew, initialData, onClose}: FormContentProps) => {
  const [name, setName] = useState(initialData?.name || '')
  const [redirectUris, setRedirectUris] = useState((initialData?.redirectUris || []).join(', '))
  const [scopes, setScopes] = useState<string[]>(
    (initialData?.scopes || []).map((s: string) => s.replace(':', '_'))
  )
  const [clientType, setClientType] = useState<'confidential' | 'public'>(
    initialData?.clientType || 'confidential'
  )
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [regenerateConfirmOpen, setRegenerateConfirmOpen] = useState(false)

  const [commitCreate] = useMutation<OAuthAppFormContentCreateMutation>(graphql`
    mutation OAuthAppFormContentCreateMutation(
      $orgId: ID!
      $name: String!
      $redirectUris: [RedirectURI!]!
      $scopes: [OAuthScopeEnum!]!
      $clientType: String
    ) {
      createOAuthAPIProvider(
        orgId: $orgId
        name: $name
        redirectUris: $redirectUris
        scopes: $scopes
        clientType: $clientType
      ) {
        provider {
          ...OAuthAppFormEdit_oauthProvider
          id
          name
          clientType
          updatedAt
        }
        clientId
        clientSecret
      }
    }
  `)

  const [commitUpdate] = useMutation(graphql`
    mutation OAuthAppFormContentUpdateMutation(
      $providerId: ID!
      $name: String
      $redirectUris: [RedirectURI!]
      $scopes: [OAuthScopeEnum!]
      $clientType: String
    ) {
      updateOAuthAPIProvider(
        providerId: $providerId
        name: $name
        redirectUris: $redirectUris
        scopes: $scopes
        clientType: $clientType
      ) {
        provider {
          ...OAuthAppFormEdit_oauthProvider
          id
          name
          clientType
          updatedAt
        }
        organization {
          id
        }
      }
    }
  `)

  const [commitRegenerate] = useMutation(graphql`
    mutation OAuthAppFormContentRegenerateMutation($providerId: ID!) {
      regenerateOAuthAPIProviderSecret(providerId: $providerId) {
        clientSecret
      }
    }
  `)

  const [clientId, setClientId] = useState(initialData?.clientId || '')
  const [clientSecret, setClientSecret] = useState(isNew ? '' : '••••••••••••••••••••')
  const [showSecret, setShowSecret] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setError(null)
    const uriList = redirectUris
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0)

    if (clientType !== 'public') {
      if (uriList.length === 0) {
        setIsSaving(false)
        setError('At least one redirect URI is required')
        return
      }

      for (const uri of uriList) {
        try {
          new URL(uri)
        } catch {
          setIsSaving(false)
          setError(`Invalid redirect URI: ${uri}`)
          return
        }
      }
    }

    if (scopes.length === 0) {
      setIsSaving(false)
      setError('At least one scope is required')
      return
    }

    const providerId = initialData?.id

    const mutationScopes = scopes as any

    if (providerId) {
      commitUpdate({
        variables: {
          providerId,
          name,
          redirectUris: clientType === 'public' ? [] : uriList,
          scopes: mutationScopes,
          clientType
        },
        onCompleted: () => {
          setIsSaving(false)
          onClose()
        },
        onError: (err) => {
          console.error(err)
          setIsSaving(false)
          setError(err.message)
        }
      })
    } else {
      commitCreate({
        variables: {
          orgId,
          name,
          redirectUris: clientType === 'public' ? [] : uriList,
          scopes: mutationScopes,
          clientType
        },
        updater: (store) => {
          const payload = store.getRootField('createOAuthAPIProvider')
          const newProvider = payload?.getLinkedRecord('provider')
          if (!newProvider) return

          const orgRecord = store.get(orgId)
          if (orgRecord) {
            const existingProviders = orgRecord.getLinkedRecords('oauthApplications') || []
            orgRecord.setLinkedRecords([...existingProviders, newProvider], 'oauthApplications')
          }
        },
        onCompleted: (response) => {
          setIsSaving(false)
          const payload = response.createOAuthAPIProvider
          if (payload) {
            setClientId(payload.clientId)
            if (payload.clientSecret) {
              setClientSecret(payload.clientSecret)
              setShowSecret(true)
            }
          }
        },
        onError: (err) => {
          console.error(err)
          setIsSaving(false)
          setError(err?.message || 'Something went wrong')
        }
      })
    }
  }

  const handleRegenerateSecret = () => {
    setRegenerateConfirmOpen(true)
  }

  const handleConfirmRegenerate = () => {
    commitRegenerate({
      variables: {
        providerId: initialData.id
      },
      onCompleted: (response: any) => {
        setClientSecret(response.regenerateOAuthAPIProviderSecret.clientSecret)
        setShowSecret(true)
        setRegenerateConfirmOpen(false)
      }
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const appOrigin = window.location.origin
  const authorizeEndpoint = makeAppURL(appOrigin, '/oauth/authorize')
  const tokenEndpoint = makeAppURL(appOrigin, '/oauth/token')
  const graphqlEndpoint = makeAppURL(appOrigin, '/graphql')

  return (
    <>
      <DialogContent className='flex flex-col overflow-hidden p-0!'>
        <div className='flex shrink-0 items-center justify-between px-6 pt-6 pb-4'>
          <DialogTitle>
            {isNew ? (name ? name : 'New Application') : 'Edit Application'}
          </DialogTitle>
        </div>

        {error && (
          <div className='shrink-0 px-6 pb-4'>
            <ErrorAlert message={error} />
          </div>
        )}

        <form
          className='flex flex-1 flex-col overflow-hidden'
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
        >
          <div className='flex-1 space-y-6 overflow-y-auto px-6 pb-4'>
            <div className='flex flex-col space-y-1'>
              <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
                Application Name
              </label>
              <BasicInput
                name='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full font-medium text-sm'
                placeholder='My Awesome App'
                error={undefined}
              />
            </div>

            {/* Client Type selector */}
            <div className='flex flex-col space-y-1'>
              <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
                Client Type
              </label>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() => setClientType('confidential')}
                  className={cn(
                    'flex-1 rounded-md border-2 p-3 text-left transition-colors',
                    clientType === 'confidential'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div className='font-semibold text-slate-800 text-sm'>Confidential</div>
                  <div className='mt-0.5 text-slate-500 text-xs'>
                    Server-to-server. Uses client secret.
                  </div>
                </button>
                <button
                  type='button'
                  onClick={() => setClientType('public')}
                  className={cn(
                    'flex-1 rounded-md border-2 p-3 text-left transition-colors',
                    clientType === 'public'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div className='font-semibold text-slate-800 text-sm'>Public (CLI / Native)</div>
                  <div className='mt-0.5 text-slate-500 text-xs'>No client secret. Uses PKCE.</div>
                </button>
              </div>
            </div>

            {clientType === 'public' && (
              <div className='rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5'>
                <div className='font-semibold text-amber-800 text-xs'>No client secret</div>
                <div className='mt-0.5 text-amber-800 text-xs'>
                  Public apps cannot securely store secrets. Authorization uses PKCE (Proof Key for
                  Code Exchange). Users will copy an authorization code from a browser page.
                </div>
              </div>
            )}

            {clientType === 'public' ? (
              <div className='flex flex-col space-y-1'>
                <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
                  Code Callback URL
                </label>
                <div className='flex'>
                  <div className='relative grow'>
                    <BasicInput
                      name='codeCallbackUrl'
                      value={makeAppURL(appOrigin, '/oauth/code/callback')}
                      disabled
                      className='w-full rounded-r-none border-slate-300! border-r-0! bg-slate-50 font-mono text-sm'
                      error={undefined}
                    />
                  </div>
                  <button
                    type='button'
                    onClick={() => copyToClipboard(makeAppURL(appOrigin, '/oauth/code/callback'))}
                    className='-ml-px relative inline-flex items-center space-x-2 rounded-r-md border border-slate-300 bg-slate-50 px-4 py-0 font-medium text-slate-700 text-sm hover:bg-slate-100'
                  >
                    <ContentCopyIcon fontSize='small' />
                  </button>
                </div>
                <div className='text-slate-400 text-xs'>
                  This page displays the authorization code for users to copy.
                </div>
              </div>
            ) : (
              <div className='flex flex-col space-y-1'>
                <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
                  Redirect URIs (Comma separated)
                </label>
                <BasicInput
                  name='redirectUris'
                  value={redirectUris}
                  onChange={(e) => setRedirectUris(e.target.value)}
                  className='w-full font-mono text-sm'
                  placeholder='https://example.com/callback'
                  error={undefined}
                />
              </div>
            )}

            <div className='flex flex-col space-y-1'>
              <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
                Scopes
              </label>
              <OAuthScopePicker selectedScopes={scopes} onScopesChange={setScopes} />
            </div>

            <div className='grid grid-cols-2 gap-6'>
              <div className='space-y-1'>
                <div className='flex h-5 items-center justify-between'>
                  <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
                    Client ID
                  </label>
                </div>
                <div className='flex'>
                  <div className='relative grow'>
                    <BasicInput
                      name='clientId'
                      value={clientId}
                      disabled
                      placeholder='Save to reveal...'
                      onChange={() => {}}
                      className='w-full rounded-r-none border-slate-300! border-r-0! bg-slate-50 font-mono text-sm'
                      autoComplete='off'
                      error={undefined}
                    />
                  </div>
                  <button
                    type='button'
                    onClick={() => copyToClipboard(clientId)}
                    className='-ml-px relative inline-flex items-center space-x-2 rounded-r-md border border-slate-300 bg-slate-50 px-4 py-0 font-medium text-slate-700 text-sm hover:bg-slate-100'
                  >
                    <ContentCopyIcon fontSize='small' />
                  </button>
                </div>
              </div>
              {clientType !== 'public' && (
                <div className='space-y-1'>
                  <div className='flex h-5 items-center justify-between'>
                    <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
                      Client Secret
                    </label>
                    {!isNew && (
                      <div className='flex items-center gap-2'>
                        {regenerateConfirmOpen ? (
                          <>
                            <span className='text-slate-500 text-xs'>Are you sure?</span>
                            <button
                              type='button'
                              onClick={handleConfirmRegenerate}
                              className='text-slate-500 hover:text-green-600'
                              title='Confirm Regenerate'
                            >
                              <CheckIcon fontSize='small' />
                            </button>
                            <button
                              type='button'
                              onClick={() => setRegenerateConfirmOpen(false)}
                              className='text-slate-500 hover:text-red-600'
                              title='Cancel'
                            >
                              <CloseIcon fontSize='small' />
                            </button>
                          </>
                        ) : (
                          <button
                            type='button'
                            onClick={handleRegenerateSecret}
                            className='font-semibold text-slate-500 text-xs tracking-wider hover:text-slate-700'
                          >
                            Regenerate
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className='flex'>
                    <div className='relative grow'>
                      <BasicInput
                        name='clientSecret'
                        autoComplete='new-password'
                        value={clientSecret}
                        disabled
                        placeholder='Save to reveal...'
                        onChange={() => {}}
                        className={cn(
                          'w-full bg-slate-50 font-mono text-sm',
                          clientSecret !== '••••••••••••••••••••' &&
                            'rounded-r-none border-slate-300! border-r-0!'
                        )}
                        type={showSecret ? 'text' : 'password'}
                        error={undefined}
                      />
                    </div>
                    {clientSecret !== '••••••••••••••••••••' && (
                      <button
                        type='button'
                        onClick={() => copyToClipboard(clientSecret)}
                        className='-ml-px relative inline-flex items-center space-x-2 rounded-r-md border border-slate-300 bg-slate-50 px-4 py-0 font-medium text-slate-700 text-sm hover:bg-slate-100'
                      >
                        <ContentCopyIcon fontSize='small' />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className='flex flex-col gap-4'>
              <div className='space-y-1'>
                <div className='flex h-5 items-center justify-between'>
                  <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
                    Authorize endpoint
                  </label>
                </div>
                <div className='flex'>
                  <div className='relative grow'>
                    <BasicInput
                      name='authorizeEndpoint'
                      value={authorizeEndpoint}
                      disabled
                      className='w-full rounded-r-none border-slate-300! border-r-0! bg-slate-50 font-mono text-sm'
                      autoComplete='off'
                      error={undefined}
                    />
                  </div>
                  <button
                    type='button'
                    onClick={() => copyToClipboard(authorizeEndpoint)}
                    className='-ml-px relative inline-flex items-center space-x-2 rounded-r-md border border-slate-300 bg-slate-50 px-4 py-0 font-medium text-slate-700 text-sm hover:bg-slate-100'
                  >
                    <ContentCopyIcon fontSize='small' />
                  </button>
                </div>
              </div>
              <div className='space-y-1'>
                <div className='flex h-5 items-center justify-between'>
                  <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
                    Token endpoint
                  </label>
                </div>
                <div className='flex'>
                  <div className='relative grow'>
                    <BasicInput
                      name='tokenEndpoint'
                      value={tokenEndpoint}
                      disabled
                      className='w-full rounded-r-none border-slate-300! border-r-0! bg-slate-50 font-mono text-sm'
                      autoComplete='off'
                      error={undefined}
                    />
                  </div>
                  <button
                    type='button'
                    onClick={() => copyToClipboard(tokenEndpoint)}
                    className='-ml-px relative inline-flex items-center space-x-2 rounded-r-md border border-slate-300 bg-slate-50 px-4 py-0 font-medium text-slate-700 text-sm hover:bg-slate-100'
                  >
                    <ContentCopyIcon fontSize='small' />
                  </button>
                </div>
              </div>
              <div className='space-y-1'>
                <div className='flex h-5 items-center justify-between'>
                  <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
                    GraphQL endpoint
                  </label>
                </div>
                <div className='flex'>
                  <div className='relative grow'>
                    <BasicInput
                      name='graphqlEndpoint'
                      value={graphqlEndpoint}
                      disabled
                      className='w-full rounded-r-none border-slate-300! border-r-0! bg-slate-50 font-mono text-sm'
                      autoComplete='off'
                      error={undefined}
                    />
                  </div>
                  <button
                    type='button'
                    onClick={() => copyToClipboard(graphqlEndpoint)}
                    className='-ml-px relative inline-flex items-center space-x-2 rounded-r-md border border-slate-300 bg-slate-50 px-4 py-0 font-medium text-slate-700 text-sm hover:bg-slate-100'
                  >
                    <ContentCopyIcon fontSize='small' />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className='flex shrink-0 justify-end border-slate-200 border-t bg-slate-50/50 p-6 pt-4'>
            <SecondaryButton type='submit' disabled={isSaving || (isNew && !!clientId)}>
              {isSaving ? 'Saving...' : isNew && !!clientId ? 'Saved' : 'Save Changes'}
            </SecondaryButton>
          </div>
        </form>
      </DialogContent>
    </>
  )
}

export default OAuthAppFormContent
