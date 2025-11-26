import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useMutation, usePreloadedQuery} from 'react-relay'
import {useHistory, useParams} from 'react-router'
import type {OAuthAppFormQuery} from '../../../../__generated__/OAuthAppFormQuery.graphql'
import BasicInput from '../../../../components/InputField/BasicInput'
import SecondaryButton from '../../../../components/SecondaryButton'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import {ElementWidth} from '../../../../types/constEnums'
import {Button} from '../../../../ui/Button/Button'

const query = graphql`
  query OAuthAppFormQuery($providerId: ID!) {
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
}

const OAuthAppForm = ({orgId}: Props) => {
  const history = useHistory()
  const {appId} = useParams<{appId?: string}>()
  const isNew = !appId || appId === 'new'

  // If editing, load data. If new, we don't need to load anything specific.
  // However, hooks order must be consistent.
  // We can use a skip pattern or just load a dummy query if new.
  // But simpler: if new, we don't use the query result.
  // Actually, useQueryLoaderNow might be tricky with conditional variables.
  // Let's just use a separate component for Edit vs New or handle it carefully.
  // For simplicity, I'll use a wrapper or just handle the query conditionally if possible,
  // but Relay hooks don't like conditional execution.

  // Better approach: If isNew, don't run query. If !isNew, run query.
  // But we need to render the same form.

  return isNew ? (
    <OAuthAppFormContent orgId={orgId} isNew={true} history={history} />
  ) : (
    <OAuthAppFormEdit orgId={orgId} appId={appId!} history={history} />
  )
}

const OAuthAppFormEdit = ({
  orgId,
  appId,
  history
}: {
  orgId: string
  appId: string
  history: ReturnType<typeof useHistory>
}) => {
  const queryRef = useQueryLoaderNow<OAuthAppFormQuery>(query, {providerId: appId})

  if (!queryRef) return null // Loading...

  return (
    <OAuthAppFormContentWithData
      queryRef={queryRef}
      orgId={orgId}
      isNew={false}
      history={history}
    />
  )
}

const OAuthAppFormContentWithData = ({
  queryRef,
  orgId,
  isNew,
  history
}: {
  queryRef: any
  orgId: string
  isNew: boolean
  history: ReturnType<typeof useHistory>
}) => {
  const data = usePreloadedQuery<OAuthAppFormQuery>(query, queryRef)
  const provider = data.oauthProvider

  if (!provider && !isNew) {
    return <div>Provider not found</div>
  }

  return (
    <OAuthAppFormContent orgId={orgId} isNew={isNew} initialData={provider} history={history} />
  )
}

interface FormContentProps {
  orgId: string
  isNew: boolean
  initialData?: any
  history: ReturnType<typeof useHistory>
}

const OAuthAppFormContent = ({orgId, isNew, initialData, history}: FormContentProps) => {
  const [name, setName] = useState(initialData?.name || '')
  const [redirectUris, setRedirectUris] = useState((initialData?.redirectUris || []).join(', '))
  const [scopes, setScopes] = useState<string[]>(initialData?.scopes || [])
  const [isSaving, setIsSaving] = useState(false)

  // For new apps, we don't have client ID/Secret until saved.
  // But the UI spec says "When adding... navigate...".
  // Usually we create first then show details, or fill form then create.
  // I'll assume fill form then create.

  const [commitCreate] = useMutation(graphql`
    mutation OAuthAppFormCreateMutation($input: CreateOAuthAPIProviderInput!) {
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
    mutation OAuthAppFormUpdateMutation($input: UpdateOAuthAPIProviderInput!) {
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
    mutation OAuthAppFormRegenerateMutation($input: RegenerateOAuthAPIProviderSecretInput!) {
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
      commitCreate({
        variables: {
          input: {
            orgId,
            name,
            redirectUris: uriList,
            scopes
          }
        },
        onCompleted: () => {
          setIsSaving(false)
          history.goBack()
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
          history.goBack()
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
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Button size='sm' variant='ghost' onClick={() => history.goBack()}>
          <ArrowBackIcon className='mr-2' />
          Back
        </Button>
        <h3 className='font-semibold text-lg text-slate-900'>
          {isNew ? (name ? name : 'New Application') : 'Edit Application'}
        </h3>
      </div>

      <div
        className='space-y-6 rounded-sm bg-white p-6 shadow-card'
        style={{maxWidth: ElementWidth.PANEL_WIDTH}}
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

        {!isNew && (
          <div className='grid grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
                Client ID
              </label>
              <div className='flex'>
                <div className='relative flex-grow'>
                  <BasicInput
                    name='clientId'
                    value={initialData.clientId}
                    disabled
                    onChange={() => {}}
                    className='!border-r-0 !border-slate-300 w-full rounded-r-none bg-slate-50 font-mono text-sm'
                    error={undefined}
                  />
                </div>
                <button
                  type='button'
                  onClick={() => copyToClipboard(initialData.clientId)}
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
                <button
                  type='button'
                  onClick={handleRegenerateSecret}
                  className='font-semibold text-slate-500 text-xs tracking-wider hover:text-slate-700'
                >
                  Regenerate
                </button>
              </div>
              <div className='flex'>
                <div className='relative flex-grow'>
                  <BasicInput
                    name='clientSecret'
                    value={clientSecret}
                    disabled
                    onChange={() => {}}
                    className='!border-r-0 !border-slate-300 w-full rounded-r-none bg-slate-50 font-mono text-sm'
                    type='password'
                    error={undefined}
                  />
                </div>
                <button
                  type='button'
                  onClick={() => copyToClipboard(clientSecret)}
                  className='-ml-px relative inline-flex items-center space-x-2 rounded-r-md border border-slate-300 bg-slate-50 px-4 py-0 font-medium text-slate-700 text-sm hover:bg-slate-100'
                >
                  <ContentCopyIcon fontSize='small' />
                </button>
              </div>
            </div>
          </div>
        )}

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
          <SecondaryButton onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </SecondaryButton>
        </div>
      </div>
    </div>
  )
}

export default OAuthAppForm
