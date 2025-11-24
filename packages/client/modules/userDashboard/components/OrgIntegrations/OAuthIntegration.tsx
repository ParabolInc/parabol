import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import KeyIcon from '@mui/icons-material/Key'
import graphql from 'babel-plugin-relay/macro'
import {useEffect, useRef, useState} from 'react'
import {useFragment, useMutation} from 'react-relay'
import type {OAuthIntegration_organization$key} from '../../../../__generated__/OAuthIntegration_organization.graphql'
import ExternalLink from '../../../../components/ExternalLink'
import BasicInput from '../../../../components/InputField/BasicInput'
import Toggle from '../../../../components/Toggle/Toggle'
import {Button} from '../../../../ui/Button/Button'

interface Props {
  organizationRef: OAuthIntegration_organization$key
}

const OAuthIntegration = ({organizationRef}: Props) => {
  const data = useFragment(
    graphql`
      fragment OAuthIntegration_organization on Organization {
        id
        oauthClientId
        oauthClientSecret
        oauthRedirectUris
        oauthScopes
      }
    `,
    organizationRef
  )

  const [enabled, setEnabled] = useState<boolean>(
    !!data.oauthClientId || (!!data.oauthRedirectUris && data.oauthRedirectUris.length > 0)
  )
  const [clientId, setClientId] = useState(data.oauthClientId || '')
  const [clientSecret, setClientSecret] = useState(data.oauthClientSecret || '')
  const [redirectUris, setRedirectUris] = useState((data.oauthRedirectUris || []).join(', '))
  const [scopes, setScopes] = useState<string[]>([...(data.oauthScopes || [])])
  const [isSaving, setIsSaving] = useState(false)

  const [commitUpdate] = useMutation(graphql`
    mutation OAuthIntegrationUpdateMutation($input: UpdateOAuthSettingsInput!) {
      updateOAuthSettings(input: $input) {
        success
        organization {
          oauthClientId
          oauthClientSecret
          oauthRedirectUris
          oauthScopes
        }
      }
    }
  `)

  const [commitRegenerate] = useMutation(graphql`
    mutation OAuthIntegrationRegenerateMutation($input: RegenerateOAuthSecretInput!) {
      regenerateOAuthSecret(input: $input) {
        secret
      }
    }
  `)

  // Update local state when data changes (e.g. after mutation or refresh)
  useEffect(() => {
    if (data.oauthClientId || (data.oauthRedirectUris && data.oauthRedirectUris.length > 0)) {
      setEnabled(true)
    } else {
      setEnabled(false)
    }

    if (data.oauthClientId) {
      setClientId(data.oauthClientId)
      setClientSecret(data.oauthClientSecret || '')
    } else {
      setClientId('')
      setClientSecret('')
    }

    // Only update redirectUris/scopes if we aren't currently editing/saving to avoid overwriting user input
    // But for simplicity, let's trust the server data on mount/update
    if (!isSaving) {
      setRedirectUris((data.oauthRedirectUris || []).join(', '))
      setScopes([...(data.oauthScopes || [])])
    }
  }, [data, isSaving])

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const saveData = (newEnabled: boolean, newRedirectUris: string, newScopes: string[]) => {
    setIsSaving(true)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      const uriList = newRedirectUris
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      commitUpdate({
        variables: {
          input: {
            orgId: data.id,
            redirectUris: uriList,
            scopes: newScopes,
            enabled: newEnabled
          }
        },
        onCompleted: (response: any) => {
          setIsSaving(false)
          if (response.updateOAuthSettings.organization) {
            const org = response.updateOAuthSettings.organization
            if (org.oauthClientId) setClientId(org.oauthClientId)
            if (org.oauthClientSecret) setClientSecret(org.oauthClientSecret)
          } else if (newEnabled === false) {
            setClientId('')
            setClientSecret('')
          }
        },
        onError: () => {
          setIsSaving(false)
        }
      })
    }, 1000) // 1 second debounce
  }

  const handleToggle = () => {
    const newEnabled = !enabled
    setEnabled(newEnabled)
    saveData(newEnabled, redirectUris, scopes)
  }

  const handleRedirectUriChange = (val: string) => {
    setRedirectUris(val)
  }

  const handleRedirectUriBlur = () => {
    saveData(enabled, redirectUris, scopes)
  }

  const handleRedirectUriKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveData(enabled, redirectUris, scopes)
    }
  }

  const toggleScope = (scope: string) => {
    let newScopes
    if (scopes.includes(scope)) {
      newScopes = scopes.filter((s) => s !== scope)
    } else {
      newScopes = [...scopes, scope]
    }
    setScopes(newScopes)
    saveData(enabled, redirectUris, newScopes)
  }

  const handleRegenerateSecret = () => {
    if (confirm('Are you sure? This will invalidate the old secret.')) {
      commitRegenerate({
        variables: {
          input: {
            orgId: data.id
          }
        },
        onCompleted: (response: any) => {
          setClientSecret(response.regenerateOAuthSecret.secret)
        }
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className='my-4 flex flex-col rounded-sm bg-white p-6 shadow-card'>
      <div className='mb-6 flex items-start justify-between'>
        <div className='flex gap-4'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-500'>
            <KeyIcon />
          </div>
          <div>
            <h3 className='font-semibold text-lg text-slate-900'>OAuth 2.0 Integration</h3>
            <p className='text-slate-500 text-sm'>
              Allow organization users to integrate with Parabol using OAuth 2.0 authentication
            </p>
          </div>
        </div>
        <Toggle active={enabled} onClick={handleToggle} />
      </div>

      {enabled && (
        <div className='space-y-6'>
          <div className='grid grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
                Client ID
              </label>
              <div className='flex'>
                <div className='relative flex-grow focus-within:z-10'>
                  <BasicInput
                    name='clientId'
                    value={clientId}
                    disabled
                    onChange={() => {}}
                    error={undefined}
                    className='!border-r-0 w-full rounded-r-none bg-slate-50 font-mono text-sm'
                  />
                </div>
                <button
                  type='button'
                  onClick={() => copyToClipboard(clientId)}
                  className='-ml-px relative inline-flex items-center space-x-2 rounded-r-md border border-slate-300 bg-slate-50 px-4 py-0 font-medium text-slate-700 text-sm hover:bg-slate-100 focus:z-10 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'
                >
                  <ContentCopyIcon fontSize='small' />
                </button>
              </div>
            </div>
            <div className='space-y-2'>
              <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
                Client Secret
              </label>
              <div className='flex gap-2'>
                <div className='flex flex-grow'>
                  <div className='relative flex-grow focus-within:z-10'>
                    <BasicInput
                      name='clientSecret'
                      value={clientSecret}
                      disabled
                      onChange={() => {}}
                      error={undefined}
                      className='!border-r-0 w-full rounded-r-none bg-slate-50 font-mono text-sm'
                      type='password'
                    />
                  </div>
                  <button
                    type='button'
                    onClick={() => copyToClipboard(clientSecret)}
                    className='-ml-px relative inline-flex items-center space-x-2 rounded-r-md border border-slate-300 bg-slate-50 px-4 py-0 font-medium text-slate-700 text-sm hover:bg-slate-100 focus:z-10 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'
                  >
                    <ContentCopyIcon fontSize='small' />
                  </button>
                </div>
                <Button variant='outline' size='sm' onClick={handleRegenerateSecret}>
                  Regenerate
                </Button>
              </div>
            </div>
            <div className='col-span-2 space-y-2'>
              <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
                Redirect URIs (Comma separated)
              </label>
              <BasicInput
                name='redirectUris'
                value={redirectUris}
                onChange={(e) => handleRedirectUriChange(e.target.value)}
                onBlur={handleRedirectUriBlur}
                onKeyDown={handleRedirectUriKeyDown}
                error={undefined}
                className='w-full font-mono text-sm'
                placeholder='https://example.com/callback, https://app.example.com/callback'
              />
              <p className='text-slate-500 text-xs'>
                Enter one or more redirect URIs separated by commas.
              </p>
            </div>
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
                  onChange={() => {
                    toggleScope('graphql:query')
                  }}
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

          <div className='flex items-center justify-between pt-2'>
            <div className='text-slate-400 text-xs'>
              {isSaving ? 'Saving...' : 'All changes saved'}
            </div>
            <ExternalLink href='https://parabol.co/docs'>View Documentation</ExternalLink>
          </div>
        </div>
      )}
    </div>
  )
}

export default OAuthIntegration
