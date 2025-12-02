import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'
import {useMutation, usePreloadedQuery, useQueryLoader} from 'react-relay'
import type {OAuthAppFormDialogQuery} from '../../../../__generated__/OAuthAppFormDialogQuery.graphql'
import BasicInput from '../../../../components/InputField/BasicInput'
import SecondaryButton from '../../../../components/SecondaryButton'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import {ElementWidth} from '../../../../types/constEnums'

const query = graphql`
  query OAuthAppFormDialogQuery($providerId: ID!) {
    oauthProvider: oauthAPIProvider(id: $providerId) {
      id
      name
      clientId
      clientSecret
      redirectUris
      scopes
    }
  }
`

interface Props {
  orgId: string
  providerId: string | null // null for new, ID for edit
  isOpen: boolean
  onClose: () => void
}

const OAuthAppFormDialog = ({orgId, providerId, isOpen, onClose}: Props) => {
  const isNew = !providerId

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        style: {maxWidth: ElementWidth.PANEL_WIDTH}
      }}
    >
      {isNew ? (
        <OAuthAppFormContent orgId={orgId} isNew={true} onClose={onClose} />
      ) : (
        <OAuthAppFormEdit orgId={orgId} providerId={providerId} onClose={onClose} />
      )}
    </Dialog>
  )
}

const OAuthAppFormEdit = ({
  orgId,
  providerId,
  onClose
}: {
  orgId: string
  providerId: string
  onClose: () => void
}) => {
  const queryRef = useQueryLoaderNow<OAuthAppFormDialogQuery>(query, {providerId})

  if (!queryRef) return null // Loading...

  return (
    <OAuthAppFormContentWithData
      queryRef={queryRef}
      orgId={orgId}
      isNew={false}
      onClose={onClose}
    />
  )
}

const OAuthAppFormContentWithData = ({
  queryRef,
  orgId,
  isNew,
  onClose
}: {
  queryRef: any
  orgId: string
  isNew: boolean
  onClose: () => void
}) => {
  const data = usePreloadedQuery<OAuthAppFormDialogQuery>(query, queryRef)
  const provider = data.oauthProvider

  if (!provider && !isNew) {
    return <div className='p-6'>Provider not found</div>
  }

  return (
    <OAuthAppFormContent orgId={orgId} isNew={isNew} initialData={provider} onClose={onClose} />
  )
}

interface FormContentProps {
  orgId: string
  isNew: boolean
  initialData?: any
  onClose: () => void
}

const generateCredentialsQuery = graphql`
  query OAuthAppFormDialogGenerateCredentialsQuery {
    generateOAuthCredentials {
      clientId
      clientSecret
    }
  }
`

// Use a separate component to read the query data to avoid suspending the whole form
const CredentialsLoader = ({
  queryRef,
  onLoaded
}: {
  queryRef: any
  onLoaded: (data: any) => void
}) => {
  const data = usePreloadedQuery<any>(generateCredentialsQuery, queryRef)
  useEffect(() => {
    if (data?.generateOAuthCredentials) {
      onLoaded(data.generateOAuthCredentials)
    }
  }, [data, onLoaded])
  return null
}

const OAuthAppFormContent = ({orgId, isNew, initialData, onClose}: FormContentProps) => {
  const [name, setName] = useState(initialData?.name || '')
  const [redirectUris, setRedirectUris] = useState((initialData?.redirectUris || []).join(', '))
  const [scopes, setScopes] = useState<string[]>(initialData?.scopes || [])
  const [isSaving, setIsSaving] = useState(false)

  const [generatedCredentials, setGeneratedCredentials] = useState<{
    clientId: string
    clientSecret: string
  } | null>(null)

  const [queryRef, loadCredentials] = useQueryLoader<any>(generateCredentialsQuery)

  useEffect(() => {
    if (isNew && !generatedCredentials) {
      loadCredentials({})
    }
  }, [isNew, generatedCredentials, loadCredentials])

  const [commitCreate] = useMutation(graphql`
    mutation OAuthAppFormDialogCreateMutation($input: CreateOAuthAPIProviderInput!) {
      createOAuthAPIProvider(input: $input) {
        provider {
          id
          name
          clientId
          clientSecret
          redirectUris
          scopes
        }
      }
    }
  `)

  const [commitUpdate] = useMutation(graphql`
    mutation OAuthAppFormDialogUpdateMutation($input: UpdateOAuthAPIProviderInput!) {
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
    mutation OAuthAppFormDialogRegenerateMutation($input: RegenerateOAuthAPIProviderSecretInput!) {
      regenerateOAuthAPIProviderSecret(input: $input) {
        secret
      }
    }
  `)

  const [clientSecret, setClientSecret] = useState(initialData?.clientSecret || '')

  const handleSave = () => {
    setIsSaving(true)
    const uriList = redirectUris
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0)

    if (isNew) {
      if (!generatedCredentials) {
        console.error('Cannot save without generated credentials')
        setIsSaving(false)
        return
      }

      commitCreate({
        variables: {
          input: {
            orgId,
            name,
            redirectUris: uriList,
            scopes,
            clientId: generatedCredentials.clientId,
            clientSecret: generatedCredentials.clientSecret
          }
        },
        onCompleted: () => {
          setIsSaving(false)
          onClose()
        },
        onError: (err) => {
          console.error(err)
          setIsSaving(false)
        }
      })
    } else {
      commitUpdate({
        variables: {
          input: {
            providerId: initialData.id,
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

  const handleRegenerateSecret = () => {
    if (confirm('Are you sure? This will invalidate the old secret.')) {
      commitRegenerate({
        variables: {
          input: {
            providerId: initialData.id
          }
        },
        onCompleted: (response: any) => {
          setClientSecret(response.regenerateOAuthAPIProviderSecret.secret)
        }
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <>
      <DialogContent className='space-y-6 p-6'>
        <div className='flex items-center justify-between'>
          <h3 className='font-semibold text-lg text-slate-900'>
            {isNew ? (name ? name : 'New Application') : 'Edit Application'}
          </h3>
          <IconButton onClick={onClose} size='small'>
            <CloseIcon />
          </IconButton>
        </div>

        <form
          className='space-y-6'
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
        >
          {queryRef && <CredentialsLoader queryRef={queryRef} onLoaded={setGeneratedCredentials} />}

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
              <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
                Client ID
              </label>
              <div className='flex'>
                <div className='relative flex-grow'>
                  <BasicInput
                    name='clientId'
                    value={
                      isNew ? generatedCredentials?.clientId || 'Loading...' : initialData.clientId
                    }
                    disabled
                    onChange={() => {}}
                    className='!border-r-0 !border-slate-300 w-full rounded-r-none bg-slate-50 font-mono text-sm'
                    error={undefined}
                  />
                </div>
                <button
                  type='button'
                  onClick={() =>
                    copyToClipboard(
                      isNew ? generatedCredentials?.clientId || '' : initialData.clientId
                    )
                  }
                  disabled={isNew && !generatedCredentials}
                  className='-ml-px relative inline-flex items-center space-x-2 rounded-r-md border border-slate-300 bg-slate-50 px-4 py-0 font-medium text-slate-700 text-sm hover:bg-slate-100 disabled:opacity-50'
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
                  <button
                    type='button'
                    onClick={handleRegenerateSecret}
                    className='font-semibold text-slate-500 text-xs tracking-wider hover:text-slate-700'
                  >
                    Regenerate
                  </button>
                )}
              </div>
              <div className='flex'>
                <div className='relative flex-grow'>
                  <BasicInput
                    name='clientSecret'
                    autoComplete='new-password'
                    value={
                      isNew ? generatedCredentials?.clientSecret || 'Loading...' : clientSecret
                    }
                    disabled
                    onChange={() => {}}
                    className='!border-r-0 !border-slate-300 w-full rounded-r-none bg-slate-50 font-mono text-sm'
                    type='password'
                    error={undefined}
                  />
                </div>
                <button
                  type='button'
                  onClick={() =>
                    copyToClipboard(isNew ? generatedCredentials?.clientSecret || '' : clientSecret)
                  }
                  disabled={isNew && !generatedCredentials}
                  className='-ml-px relative inline-flex items-center space-x-2 rounded-r-md border border-slate-300 bg-slate-50 px-4 py-0 font-medium text-slate-700 text-sm hover:bg-slate-100 disabled:opacity-50'
                >
                  <ContentCopyIcon fontSize='small' />
                </button>
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

export default OAuthAppFormDialog
