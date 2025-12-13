import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'
import {useMutation} from 'react-relay'
import ErrorAlert from '../../../../components/ErrorAlert/ErrorAlert'
import BasicInput from '../../../../components/InputField/BasicInput'
import SecondaryButton from '../../../../components/SecondaryButton'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'

export interface FormContentProps {
  orgId: string
  isNew: boolean
  initialData?: any
  onClose: () => void
}

const OAuthAppFormContent = ({orgId, isNew, initialData, onClose}: FormContentProps) => {
  const [name, setName] = useState(initialData?.name || '')
  const [redirectUris, setRedirectUris] = useState((initialData?.redirectUris || []).join(', '))
  const [scopes, setScopes] = useState<string[]>(initialData?.scopes || [])
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [regenerateConfirmOpen, setRegenerateConfirmOpen] = useState(false)

  const [commitCreate] = useMutation(graphql`
    mutation OAuthAppFormContentCreateMutation($input: CreateOAuthAPIProviderInput!) {
      createOAuthAPIProvider(input: $input) {
        provider {
          id
          name
          redirectUris
          scopes
        }
        clientId
        clientSecret
      }
    }
  `)

  const [commitUpdate] = useMutation(graphql`
    mutation OAuthAppFormContentUpdateMutation($input: UpdateOAuthAPIProviderInput!) {
      updateOAuthAPIProvider(input: $input) {
        provider {
          id
          name
          redirectUris
          scopes
        }
      }
    }
  `)

  const [commitRegenerate] = useMutation(graphql`
    mutation OAuthAppFormContentRegenerateMutation($input: RegenerateOAuthAPIProviderSecretInput!) {
      regenerateOAuthAPIProviderSecret(input: $input) {
        secret
      }
    }
  `)

  const [clientId, setClientId] = useState(initialData?.clientId || '')
  const [clientSecret, setClientSecret] = useState(isNew ? '' : '••••••••••••••••••••')
  const [credentialToken, setCredentialToken] = useState('')
  const [showSecret, setShowSecret] = useState(false)

  const handleSave = () => {
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

    if (scopes.length === 0) {
      setIsSaving(false)
      setError('At least one scope is required')
      return
    }

    const providerId = initialData?.id

    if (providerId) {
      commitUpdate({
        variables: {
          input: {
            providerId,
            name,
            redirectUris: uriList,
            scopes
          }
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
          input: {
            orgId,
            name,
            redirectUris: uriList,
            scopes,
            credentialToken
          }
        },
        updater: (store) => {
          const payload = store.getRootField('createOAuthAPIProvider')
          const newProvider = payload?.getLinkedRecord('provider')
          if (!newProvider) return

          const orgRecord = store.get(orgId)
          if (!orgRecord) return

          const providers = orgRecord.getLinkedRecords('oauthProviders') || []
          const newProviders = [...providers, newProvider]
          orgRecord.setLinkedRecords(newProviders, 'oauthProviders')
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
    }
  }

  const toggleScope = (scope: string) => {
    if (scopes.includes(scope)) {
      setScopes(scopes.filter((s) => s !== scope))
    } else {
      setScopes([...scopes, scope])
    }
  }

  const [generateCredentials] = useMutation(graphql`
    mutation OAuthAppFormContentGenerateCredentialsMutation {
      generateOAuthCredentials {
        clientId
        clientSecret
        credentialToken
      }
    }
  `)

  useEffect(() => {
    if (isNew && !clientId) {
      generateCredentials({
        variables: {},
        onCompleted: (response: any) => {
          setClientId(response.generateOAuthCredentials.clientId)
          setClientSecret(response.generateOAuthCredentials.clientSecret)
          setCredentialToken(response.generateOAuthCredentials.credentialToken)
          setShowSecret(true)
        }
      })
    }
  }, [isNew, clientId, generateCredentials])

  const handleRegenerateSecret = () => {
    setRegenerateConfirmOpen(true)
  }

  const handleConfirmRegenerate = () => {
    commitRegenerate({
      variables: {
        input: {
          providerId: initialData.id
        }
      },
      onCompleted: (response: any) => {
        setClientSecret(response.regenerateOAuthAPIProviderSecret.secret)
        setShowSecret(true)
        setRegenerateConfirmOpen(false)
      }
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <>
      <DialogContent className='space-y-6 pt-3'>
        <div className='flex items-center justify-between'>
          <DialogTitle>
            {isNew ? (name ? name : 'New Application') : 'Edit Application'}
          </DialogTitle>
        </div>

        {error && <ErrorAlert message={error} />}

        <form
          className='space-y-6'
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
        >
          <div className='space-y-2'>
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

          <div className='grid grid-cols-2 gap-6'>
            <div className='space-y-2'>
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
            <div className='space-y-2'>
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
                    onChange={() => {}}
                    className={`w-full bg-slate-50 font-mono text-sm ${
                      clientSecret === '••••••••••••••••••••'
                        ? ''
                        : 'rounded-r-none border-slate-300! border-r-0!'
                    }
`}
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
          </div>

          <div className='space-y-2'>
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

          <div className='space-y-2'>
            <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
              Scopes
            </label>
            <div className='flex gap-4'>
              <label className='flex cursor-pointer items-center gap-2 text-slate-700 text-sm'>
                <input
                  type='checkbox'
                  checked={scopes.includes('graphql:query')}
                  onChange={() => toggleScope('graphql:query')}
                  className='rounded border-slate-300 text-sky-500 focus:ring-sky-500'
                />
                graphql:query
              </label>
              <label className='flex cursor-pointer items-center gap-2 text-slate-700 text-sm'>
                <input
                  type='checkbox'
                  checked={scopes.includes('graphql:mutation')}
                  onChange={() => toggleScope('graphql:mutation')}
                  className='rounded border-slate-300 text-sky-500 focus:ring-sky-500'
                />
                graphql:mutation
              </label>
            </div>
          </div>

          <div className='flex justify-end pt-4'>
            <SecondaryButton type='submit' disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </SecondaryButton>
          </div>
        </form>
      </DialogContent>
    </>
  )
}

export default OAuthAppFormContent
