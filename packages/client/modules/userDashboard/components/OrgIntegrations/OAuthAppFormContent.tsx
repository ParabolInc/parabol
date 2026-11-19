import {useState} from 'react'
import getMutationError from '~/utils/relay/getMutationError'
import type {OAuthAppFormEdit_oauthProvider$data} from '../../../../__generated__/OAuthAppFormEdit_oauthProvider.graphql'
import type {OAuthScopeEnum} from '../../../../__generated__/useCreateOAuthAPIProviderMutation.graphql'
import ErrorAlert from '../../../../components/ErrorAlert/ErrorAlert'
import BasicInput from '../../../../components/InputField/BasicInput'
import TipBanner from '../../../../components/TipBanner'
import useCreateOAuthAPIProviderMutation from '../../../../mutations/useCreateOAuthAPIProviderMutation'
import useUpdateOAuthAPIProviderMutation from '../../../../mutations/useUpdateOAuthAPIProviderMutation'
import {Button} from '../../../../ui/Button/Button'
import {DialogActions} from '../../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'
import {TokenScopesTable} from '../TokenScopesTable'
import OAuthCopyField from './OAuthCopyField'

export interface FormContentProps {
  orgId: string
  isNew: boolean
  initialData?: Omit<OAuthAppFormEdit_oauthProvider$data, ' $fragmentType'>
  onClose: () => void
}

const OAuthAppFormContent = ({orgId, isNew, initialData, onClose}: FormContentProps) => {
  const [name, setName] = useState(initialData?.name || '')
  const [redirectUris, setRedirectUris] = useState((initialData?.redirectUris || []).join(', '))
  const [scopes, setScopes] = useState<Set<OAuthScopeEnum>>(
    new Set(
      (initialData?.scopes ?? []).map(
        (scope) => scope.toUpperCase().replace(':', '_') as OAuthScopeEnum
      )
    )
  )
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [clientId, setClientId] = useState(initialData?.clientId || '')

  const [createProvider] = useCreateOAuthAPIProviderMutation()
  const [updateProvider] = useUpdateOAuthAPIProviderMutation()

  const onSaveError = (err: Error) => {
    console.error(err)
    setIsSaving(false)
    setError(getMutationError(err).message)
  }

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

    if (scopes.size === 0) {
      setIsSaving(false)
      setError('At least one scope is required')
      return
    }

    const providerId = initialData?.id
    const mutationScopes = [...scopes]

    if (providerId) {
      updateProvider({
        variables: {
          providerId,
          name,
          redirectUris: uriList,
          scopes: mutationScopes
        },
        onCompleted: (_response, errors) => {
          setIsSaving(false)
          const firstError = errors?.[0]
          if (firstError) {
            setError(firstError.message)
            return
          }
          onClose()
        },
        onError: onSaveError
      })
    } else {
      createProvider({
        variables: {
          orgId,
          name,
          redirectUris: uriList,
          scopes: mutationScopes
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
        onCompleted: (response, errors) => {
          setIsSaving(false)
          const firstError = errors?.[0]
          if (firstError) {
            setError(firstError.message)
            return
          }
          setClientId(response.createOAuthAPIProvider.clientId)
        },
        onError: onSaveError
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

            <TokenScopesTable selectedScopes={scopes} toggleScope={toggleScope} />

            <OAuthCopyField
              label='Client ID'
              name='clientId'
              value={clientId}
              placeholder='Save to reveal...'
            />
            <TipBanner>
              <b>No client secret.</b> The app must send a PKCE code challenge (S256) when it signs
              in. Parabol refuses sign-ins without one.
            </TipBanner>
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
      </DialogContent>
    </>
  )
}

export default OAuthAppFormContent
