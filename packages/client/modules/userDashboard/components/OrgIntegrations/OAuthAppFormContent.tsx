import {useState} from 'react'
import {Info as InfoIcon} from '~/ui/icons'
import getMutationError from '~/utils/relay/getMutationError'
import type {OAuthAppFormEdit_oauthProvider$data} from '../../../../__generated__/OAuthAppFormEdit_oauthProvider.graphql'
import type {OAuthScopeEnum} from '../../../../__generated__/useCreateOAuthAPIProviderMutation.graphql'
import ErrorAlert from '../../../../components/ErrorAlert/ErrorAlert'
import BasicInput from '../../../../components/InputField/BasicInput'
import useCreateOAuthAPIProviderMutation from '../../../../mutations/useCreateOAuthAPIProviderMutation'
import useRegenerateOAuthAPIProviderSecretMutation from '../../../../mutations/useRegenerateOAuthAPIProviderSecretMutation'
import useUpdateOAuthAPIProviderMutation from '../../../../mutations/useUpdateOAuthAPIProviderMutation'
import {Button} from '../../../../ui/Button/Button'
import {cn} from '../../../../ui/cn'
import {DialogActions} from '../../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'
import makeAppURL from '../../../../utils/makeAppURL'
import {TokenScopesTable} from '../TokenScopesTable'
import OAuthClientSecretField, {MASKED_SECRET} from './OAuthClientSecretField'
import OAuthClientTypeField, {type OAuthClientType} from './OAuthClientTypeField'
import OAuthClientTypeSwitchDialog from './OAuthClientTypeSwitchDialog'
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
  const initialClientType: OAuthClientType = initialData?.clientType ?? 'CONFIDENTIAL'
  const [clientType, setClientType] = useState<OAuthClientType>(initialClientType)
  const [savedClientType, setSavedClientType] = useState<OAuthClientType>(initialClientType)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [switchConfirmOpen, setSwitchConfirmOpen] = useState(false)
  const [clientId, setClientId] = useState(initialData?.clientId || '')
  const [clientSecret, setClientSecret] = useState(
    isNew || initialClientType === 'PUBLIC' ? '' : MASKED_SECRET
  )
  const [showSecret, setShowSecret] = useState(false)

  const [createProvider] = useCreateOAuthAPIProviderMutation()
  const [updateProvider] = useUpdateOAuthAPIProviderMutation()
  const [regenerateSecret] = useRegenerateOAuthAPIProviderSecretMutation()

  const revealSecret = (secret: string) => {
    setClientSecret(secret)
    setShowSecret(true)
  }

  const onSaveError = (err: Error) => {
    console.error(err)
    setIsSaving(false)
    setError(getMutationError(err).message)
  }

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
      updateProvider({
        variables: {
          providerId,
          name,
          redirectUris: uriList,
          scopes: mutationScopes,
          clientType: isSwitchingClientType ? clientType : undefined
        },
        onCompleted: (response, errors) => {
          setIsSaving(false)
          const firstError = errors?.[0]
          if (firstError) {
            setError(firstError.message)
            return
          }
          const newSecret = response.updateOAuthAPIProvider.clientSecret
          if (newSecret) {
            setSavedClientType('CONFIDENTIAL')
            revealSecret(newSecret)
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
        onCompleted: (response, errors) => {
          setIsSaving(false)
          const firstError = errors?.[0]
          if (firstError) {
            setError(firstError.message)
            return
          }
          const payload = response.createOAuthAPIProvider
          setClientId(payload.clientId)
          if (payload.clientSecret) revealSecret(payload.clientSecret)
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

  const handleRegenerate = () => {
    if (!initialData?.id) return
    regenerateSecret({
      variables: {providerId: initialData.id},
      onCompleted: (response) => {
        const secret = response.regenerateOAuthAPIProviderSecret?.clientSecret
        if (secret) revealSecret(secret)
      }
    })
  }

  const isConfidential = clientType === 'CONFIDENTIAL'
  const appOrigin = window.location.origin

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
              <OAuthCopyField
                label='Client ID'
                name='clientId'
                value={clientId}
                placeholder='Save to reveal...'
              />
              {isConfidential && (
                <OAuthClientSecretField
                  clientSecret={clientSecret}
                  showSecret={showSecret}
                  canRegenerate={!isNew && savedClientType === 'CONFIDENTIAL'}
                  onRegenerate={handleRegenerate}
                />
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
              <OAuthCopyField
                label='Authorize endpoint'
                name='authorizeEndpoint'
                value={makeAppURL(appOrigin, '/oauth/authorize')}
              />
              <OAuthCopyField
                label='Token endpoint'
                name='tokenEndpoint'
                value={makeAppURL(appOrigin, '/oauth/token')}
              />
              <OAuthCopyField
                label='GraphQL endpoint'
                name='graphqlEndpoint'
                value={makeAppURL(appOrigin, '/graphql')}
              />
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
          appName={name || initialData?.name || ''}
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
