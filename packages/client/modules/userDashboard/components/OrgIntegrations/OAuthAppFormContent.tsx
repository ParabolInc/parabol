import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useMutation} from 'react-relay'
import {
  Check as CheckIcon,
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon,
  Info as InfoIcon
} from '~/ui/icons'
import getMutationError from '~/utils/relay/getMutationError'
import type {
  OAuthAppFormContentCreateMutation,
  OAuthScopeEnum
} from '../../../../__generated__/OAuthAppFormContentCreateMutation.graphql'
import type {OAuthAppFormContentUpdateMutation} from '../../../../__generated__/OAuthAppFormContentUpdateMutation.graphql'
import ErrorAlert from '../../../../components/ErrorAlert/ErrorAlert'
import BasicInput from '../../../../components/InputField/BasicInput'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {snackOnError} from '../../../../mutations/handlers/snackOnError'
import {Button} from '../../../../ui/Button/Button'
import {cn} from '../../../../ui/cn'
import {DialogActions} from '../../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'
import makeAppURL from '../../../../utils/makeAppURL'
import {TokenScopesTable} from '../TokenScopesTable'
import OAuthClientTypeField, {type OAuthClientType} from './OAuthClientTypeField'
import OAuthClientTypeSwitchDialog from './OAuthClientTypeSwitchDialog'

const MASKED_SECRET = '••••••••••••••••••••'

export interface FormContentProps {
  orgId: string
  isNew: boolean
  initialData?: any
  onClose: () => void
}

const OAuthAppFormContent = ({orgId, isNew, initialData, onClose}: FormContentProps) => {
  const atmosphere = useAtmosphere()
  const [name, setName] = useState(initialData?.name || '')
  const [redirectUris, setRedirectUris] = useState((initialData?.redirectUris || []).join(', '))
  const [scopes, setScopes] = useState<Set<OAuthScopeEnum>>(
    new Set(
      (initialData?.scopes ?? []).map(
        (scope: string) => scope.toUpperCase().replace(':', '_') as OAuthScopeEnum
      )
    )
  )
  const initialClientType: OAuthClientType =
    initialData?.clientType === 'PUBLIC' ? 'PUBLIC' : 'CONFIDENTIAL'
  const [clientType, setClientType] = useState<OAuthClientType>(initialClientType)
  const [savedClientType, setSavedClientType] = useState<OAuthClientType>(initialClientType)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [regenerateConfirmOpen, setRegenerateConfirmOpen] = useState(false)
  const [switchConfirmOpen, setSwitchConfirmOpen] = useState(false)

  const [commitCreate] = useMutation<OAuthAppFormContentCreateMutation>(graphql`
    mutation OAuthAppFormContentCreateMutation(
      $orgId: ID!
      $name: String!
      $redirectUris: [RedirectURI!]!
      $scopes: [OAuthScopeEnum!]!
      $clientType: OAuthClientTypeEnum!
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
          updatedAt
        }
        clientId
        clientSecret
      }
    }
  `)

  const [commitUpdate] = useMutation<OAuthAppFormContentUpdateMutation>(graphql`
    mutation OAuthAppFormContentUpdateMutation(
      $providerId: ID!
      $name: String
      $redirectUris: [RedirectURI!]
      $scopes: [OAuthScopeEnum!]
      $clientType: OAuthClientTypeEnum
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
          updatedAt
        }
        organization {
          id
        }
        clientSecret
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
  const [clientSecret, setClientSecret] = useState(
    isNew || initialClientType === 'PUBLIC' ? '' : MASKED_SECRET
  )
  const [showSecret, setShowSecret] = useState(false)

  const handleSave = (isClientTypeSwitchConfirmed = false) => {
    setIsSaving(true)
    setError(null)
    const uriList = redirectUris
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0)

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

    if (scopes.size === 0) {
      setIsSaving(false)
      setError('At least one scope is required')
      return
    }

    const providerId = initialData?.id
    const isSwitchingClientType = !!providerId && clientType !== savedClientType
    if (isSwitchingClientType && !isClientTypeSwitchConfirmed) {
      setIsSaving(false)
      setSwitchConfirmOpen(true)
      return
    }

    const mutationScopes = [...scopes]

    if (providerId) {
      commitUpdate({
        variables: {
          providerId,
          name,
          redirectUris: uriList,
          scopes: mutationScopes,
          clientType: isSwitchingClientType ? clientType : undefined
        },
        onCompleted: (response) => {
          setIsSaving(false)
          const newSecret = response.updateOAuthAPIProvider.clientSecret
          if (newSecret) {
            setSavedClientType('CONFIDENTIAL')
            setClientSecret(newSecret)
            setShowSecret(true)
            return
          }
          onClose()
        },
        onError: (err) => {
          console.error(err)
          setIsSaving(false)
          setError(getMutationError(err).message)
        }
      })
    } else {
      commitCreate({
        variables: {
          orgId,
          name,
          redirectUris: uriList,
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
          setError(getMutationError(err).message)
        }
      })
    }
  }

  const toggleScope = (scope: OAuthScopeEnum, pairedRead?: OAuthScopeEnum) => {
    setScopes((prev) => {
      const next = new Set(prev)
      if (next.has(scope)) {
        next.delete(scope)
      } else {
        next.add(scope)
        if (pairedRead) next.add(pairedRead)
      }
      return next
    })
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
      },
      onError: snackOnError(atmosphere)
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const isConfidential = clientType === 'CONFIDENTIAL'
  const appOrigin = window.location.origin
  const authorizeEndpoint = makeAppURL(appOrigin, '/oauth/authorize')
  const tokenEndpoint = makeAppURL(appOrigin, '/oauth/token')
  const graphqlEndpoint = makeAppURL(appOrigin, '/graphql')

  return (
    <>
      <DialogContent>
        <DialogTitle className='mb-4'>
          {isNew ? (name ? name : 'New Application') : 'Edit Application'}
        </DialogTitle>

        {error && (
          <div className='pb-4'>
            <ErrorAlert message={error} />
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
        >
          <div className='space-y-6'>
            <div className='flex flex-col space-y-1'>
              <label className='font-semibold text-fg-muted text-xs uppercase tracking-wider'>
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

            <div className='flex flex-col space-y-1'>
              <label className='font-semibold text-fg-muted text-xs uppercase tracking-wider'>
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

            <OAuthClientTypeField
              value={clientType}
              onChange={setClientType}
              disabled={isNew && !!clientId}
            />

            <TokenScopesTable selectedScopes={scopes} toggleScope={toggleScope} />

            <div className={cn('grid gap-6', isConfidential && 'grid-cols-2')}>
              <div className='space-y-1'>
                <div className='flex h-5 items-center justify-between'>
                  <label className='font-semibold text-fg-muted text-xs uppercase tracking-wider'>
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
                      className='w-full rounded-r-none border-hairline! border-r-0! bg-surface-well font-mono text-sm'
                      autoComplete='off'
                      error={undefined}
                    />
                  </div>
                  <button
                    type='button'
                    onClick={() => copyToClipboard(clientId)}
                    className='-ml-px relative inline-flex items-center space-x-2 rounded-r-md border border-hairline bg-surface-well px-4 py-0 font-medium text-fg-primary text-sm hover:bg-surface-hover'
                  >
                    <ContentCopyIcon className='text-[20px]' />
                  </button>
                </div>
              </div>
              {isConfidential && (
                <div className='space-y-1'>
                  <div className='flex h-5 items-center justify-between'>
                    <label className='font-semibold text-fg-muted text-xs uppercase tracking-wider'>
                      Client Secret
                    </label>
                    {!isNew && savedClientType === 'CONFIDENTIAL' && (
                      <div className='flex items-center gap-2'>
                        {regenerateConfirmOpen ? (
                          <>
                            <span className='text-fg-muted text-xs'>Are you sure?</span>
                            <button
                              type='button'
                              onClick={handleConfirmRegenerate}
                              className='text-fg-muted hover:text-jade-600'
                              title='Confirm Regenerate'
                            >
                              <CheckIcon className='text-[20px]' />
                            </button>
                            <button
                              type='button'
                              onClick={() => setRegenerateConfirmOpen(false)}
                              className='text-fg-muted hover:text-tomato-600'
                              title='Cancel'
                            >
                              <CloseIcon className='text-[20px]' />
                            </button>
                          </>
                        ) : (
                          <button
                            type='button'
                            onClick={handleRegenerateSecret}
                            className='font-semibold text-fg-muted text-xs tracking-wider hover:text-fg-primary'
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
                          'w-full bg-surface-well font-mono text-sm',
                          clientSecret !== MASKED_SECRET &&
                            'rounded-r-none border-hairline! border-r-0!'
                        )}
                        type={showSecret ? 'text' : 'password'}
                        error={undefined}
                      />
                    </div>
                    {clientSecret !== MASKED_SECRET && (
                      <button
                        type='button'
                        onClick={() => copyToClipboard(clientSecret)}
                        className='-ml-px relative inline-flex items-center space-x-2 rounded-r-md border border-hairline bg-surface-well px-4 py-0 font-medium text-fg-primary text-sm hover:bg-surface-hover'
                      >
                        <ContentCopyIcon className='text-[20px]' />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            {!isConfidential && (
              <div
                role='note'
                className='flex items-start gap-2 rounded-lg border border-callout-info-edge bg-callout-info-fill p-3 text-fg-primary text-sm'
              >
                <InfoIcon className='mt-0.5 text-[18px] text-callout-info-icon' />
                <span>
                  <b>No client secret.</b> This app must send a PKCE code challenge (S256) when it
                  signs in. Parabol refuses sign-ins from it without one.
                </span>
              </div>
            )}
            <div className='flex flex-col gap-4'>
              <div className='space-y-1'>
                <div className='flex h-5 items-center justify-between'>
                  <label className='font-semibold text-fg-muted text-xs uppercase tracking-wider'>
                    Authorize endpoint
                  </label>
                </div>
                <div className='flex'>
                  <div className='relative grow'>
                    <BasicInput
                      name='authorizeEndpoint'
                      value={authorizeEndpoint}
                      disabled
                      className='w-full rounded-r-none border-hairline! border-r-0! bg-surface-well font-mono text-sm'
                      autoComplete='off'
                      error={undefined}
                    />
                  </div>
                  <button
                    type='button'
                    onClick={() => copyToClipboard(authorizeEndpoint)}
                    className='-ml-px relative inline-flex items-center space-x-2 rounded-r-md border border-hairline bg-surface-well px-4 py-0 font-medium text-fg-primary text-sm hover:bg-surface-hover'
                  >
                    <ContentCopyIcon className='text-[20px]' />
                  </button>
                </div>
              </div>
              <div className='space-y-1'>
                <div className='flex h-5 items-center justify-between'>
                  <label className='font-semibold text-fg-muted text-xs uppercase tracking-wider'>
                    Token endpoint
                  </label>
                </div>
                <div className='flex'>
                  <div className='relative grow'>
                    <BasicInput
                      name='tokenEndpoint'
                      value={tokenEndpoint}
                      disabled
                      className='w-full rounded-r-none border-hairline! border-r-0! bg-surface-well font-mono text-sm'
                      autoComplete='off'
                      error={undefined}
                    />
                  </div>
                  <button
                    type='button'
                    onClick={() => copyToClipboard(tokenEndpoint)}
                    className='-ml-px relative inline-flex items-center space-x-2 rounded-r-md border border-hairline bg-surface-well px-4 py-0 font-medium text-fg-primary text-sm hover:bg-surface-hover'
                  >
                    <ContentCopyIcon className='text-[20px]' />
                  </button>
                </div>
              </div>
              <div className='space-y-1'>
                <div className='flex h-5 items-center justify-between'>
                  <label className='font-semibold text-fg-muted text-xs uppercase tracking-wider'>
                    GraphQL endpoint
                  </label>
                </div>
                <div className='flex'>
                  <div className='relative grow'>
                    <BasicInput
                      name='graphqlEndpoint'
                      value={graphqlEndpoint}
                      disabled
                      className='w-full rounded-r-none border-hairline! border-r-0! bg-surface-well font-mono text-sm'
                      autoComplete='off'
                      error={undefined}
                    />
                  </div>
                  <button
                    type='button'
                    onClick={() => copyToClipboard(graphqlEndpoint)}
                    className='-ml-px relative inline-flex items-center space-x-2 rounded-r-md border border-hairline bg-surface-well px-4 py-0 font-medium text-fg-primary text-sm hover:bg-surface-hover'
                  >
                    <ContentCopyIcon className='text-[20px]' />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <DialogActions>
            <Button
              variant='primary'
              size='md'
              type='submit'
              disabled={isSaving || (isNew && !!clientId)}
            >
              {isSaving ? 'Saving...' : isNew && !!clientId ? 'Saved' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
        <OAuthClientTypeSwitchDialog
          appName={name || initialData?.name}
          clientType={clientType}
          isOpen={switchConfirmOpen}
          onClose={() => setSwitchConfirmOpen(false)}
          onConfirm={() => {
            setSwitchConfirmOpen(false)
            handleSave(true)
          }}
        />
      </DialogContent>
    </>
  )
}

export default OAuthAppFormContent
