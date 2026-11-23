import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {PersonalAccessTokenUpsertDialog_viewer$key} from '~/__generated__/PersonalAccessTokenUpsertDialog_viewer.graphql'
import getMutationError from '~/utils/relay/getMutationError'
import type {OAuthScopeEnum} from '../../../__generated__/useCreatePersonalAccessTokenMutation.graphql'
import BasicInput from '../../../components/InputField/BasicInput'
import useResourceGrants, {isGrantingNothing} from '../../../hooks/useResourceGrants'
import useScopeSelection from '../../../hooks/useScopeSelection'
import {useCreatePersonalAccessToken} from '../../../mutations/useCreatePersonalAccessToken'
import {useUpdatePersonalAccessToken} from '../../../mutations/useUpdatePersonalAccessToken'
import {Button} from '../../../ui/Button/Button'
import {Dialog} from '../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../ui/Dialog/DialogTitle'
import {ExpirationDatePicker} from './ExpirationDatePicker'
import {OrgTeamGrant} from './OrgTeamGrant'
import {PageGrant} from './PageGrant'
import {PersonalAccessTokenCreateSuccess} from './PersonalAccessTokenCreateSuccess'
import {TokenScopesTable} from './TokenScopesTable'

const maxExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

export type TokenForEdit = {
  id: string
  name: string
  scopes: readonly string[]
  grantedOrgIds: readonly string[] | null
  grantedTeamIds: readonly string[] | null
  grantedPageIds: readonly string[] | null
  expiresAt: string | null
}

interface Props {
  viewerRef: PersonalAccessTokenUpsertDialog_viewer$key
  onClose: () => void
  personalAccessToken?: TokenForEdit
}

const PersonalAccessTokenUpsertDialog = ({viewerRef, onClose, personalAccessToken}: Props) => {
  const isEdit = personalAccessToken !== undefined
  const [commitCreate, creatingSubmitting] = useCreatePersonalAccessToken()
  const [commitUpdate, updatingSubmitting] = useUpdatePersonalAccessToken()
  const submitting = isEdit ? updatingSubmitting : creatingSubmitting

  const viewer = useFragment(
    graphql`
      fragment PersonalAccessTokenUpsertDialog_viewer on User {
        ...OrgTeamGrant_viewer
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

  const [tokenName, setTokenName] = useState(personalAccessToken?.name ?? '')
  const [expiresAt, setExpiresAt] = useState<Date>(
    personalAccessToken?.expiresAt ? new Date(personalAccessToken.expiresAt) : maxExpiresAt
  )
  const {selectedScopes, toggleScope} = useScopeSelection(
    (personalAccessToken?.scopes ?? []) as OAuthScopeEnum[]
  )
  const [error, setError] = useState<string | null>(null)
  const resourceGrants = useResourceGrants(personalAccessToken)
  const grants = resourceGrants.getGrants(viewer.organizations)
  const [createdToken, setCreatedToken] = useState<string | null>(null)

  const handleSubmit = () => {
    if (!tokenName.trim()) {
      setError('Label is required')
      return
    }
    if (selectedScopes.size === 0) {
      setError('Select at least one scope')
      return
    }
    setError(null)
    if (isEdit) {
      commitUpdate({
        variables: {
          tokenId: personalAccessToken.id,
          name: tokenName.trim(),
          scopes: [...selectedScopes] as OAuthScopeEnum[],
          ...grants,
          expiresAt: expiresAt.toISOString()
        },
        onCompleted: (_response, errors) => {
          const firstError = errors?.[0]?.message
          if (firstError) {
            setError(firstError)
            return
          }
          onClose()
        },
        onError: (err) => setError(getMutationError(err).message)
      })
    } else {
      commitCreate({
        variables: {
          name: tokenName.trim(),
          scopes: [...selectedScopes] as OAuthScopeEnum[],
          ...grants,
          expiresAt: expiresAt.toISOString()
        },
        onCompleted: (response, errors) => {
          const firstError = errors?.[0]?.message
          if (firstError) {
            setError(firstError)
            return
          }
          setCreatedToken(response.createPersonalAccessToken.token)
        },
        onError: (err) => setError(getMutationError(err).message)
      })
    }
  }

  if (createdToken) {
    return <PersonalAccessTokenCreateSuccess token={createdToken} onClose={onClose} />
  }

  return (
    <Dialog onClose={onClose} isOpen>
      <DialogContent>
        <DialogTitle className='mb-4'>
          {isEdit ? 'Edit Personal Access Token' : 'New Personal Access Token'}
        </DialogTitle>
        {error && (
          <div className='mb-4 animate-shake rounded-md py-2 font-medium text-fg-error text-sm'>
            {error}
          </div>
        )}
        <div className='space-y-6'>
          <div className='flex flex-col gap-1'>
            <label className='font-semibold text-fg-muted text-xs uppercase tracking-wider'>
              Name
            </label>
            <BasicInput
              name='name'
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder='e.g. CI pipeline token'
              className='w-full'
              error={undefined}
            />
          </div>
          <ExpirationDatePicker selected={expiresAt} onSelect={setExpiresAt} />
          <TokenScopesTable selectedScopes={selectedScopes} toggleScope={toggleScope} />
          <div className='flex flex-col gap-4'>
            <div>
              <label className='font-semibold text-fg-muted text-xs uppercase tracking-wider'>
                Resource Grants
              </label>
              <p className='mt-1 text-fg-muted text-xs'>
                By default, a token has access to all resources you can access. Optionally restrict
                it to specific organizations, teams, or pages below.
              </p>
            </div>
            <OrgTeamGrant viewerRef={viewer} {...resourceGrants} />
            <PageGrant {...resourceGrants} />
          </div>
        </div>
        <DialogActions>
          <Button variant='outline' size='md' onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant='primary'
            size='md'
            onClick={handleSubmit}
            disabled={submitting || isGrantingNothing(grants)}
          >
            {submitting
              ? isEdit
                ? 'Saving…'
                : 'Creating…'
              : isEdit
                ? 'Save Changes'
                : 'Create Token'}
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default PersonalAccessTokenUpsertDialog
