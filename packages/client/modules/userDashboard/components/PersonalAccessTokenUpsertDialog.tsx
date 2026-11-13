import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {PersonalAccessTokenUpsertDialog_viewer$key} from '~/__generated__/PersonalAccessTokenUpsertDialog_viewer.graphql'
import getMutationError from '~/utils/relay/getMutationError'
import type {OAuthScopeEnum} from '../../../__generated__/useCreatePersonalAccessTokenMutation.graphql'
import BasicInput from '../../../components/InputField/BasicInput'
import {useCreatePersonalAccessToken} from '../../../mutations/useCreatePersonalAccessToken'
import {useUpdatePersonalAccessToken} from '../../../mutations/useUpdatePersonalAccessToken'
import {Button} from '../../../ui/Button/Button'
import {Dialog} from '../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../ui/Dialog/DialogTitle'
import {ExpirationDatePicker} from './ExpirationDatePicker'
import {OrgTeamGrant} from './OrgTeamGrant'
import {PageGrant, type PageResult} from './PageGrant'
import {PersonalAccessTokenCreateSuccess} from './PersonalAccessTokenCreateSuccess'
import {TokenScopesTable} from './TokenScopesTable'

const maxExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

export type GrantModeOption = 'all' | 'custom'

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
  const [selectedScopes, setSelectedScopes] = useState<Set<OAuthScopeEnum>>(
    new Set((personalAccessToken?.scopes ?? []) as OAuthScopeEnum[])
  )
  const [error, setError] = useState<string | null>(null)

  const [orgGrantMode, setOrgGrantMode] = useState<GrantModeOption>(
    personalAccessToken?.grantedOrgIds !== null && personalAccessToken?.grantedOrgIds !== undefined
      ? 'custom'
      : 'all'
  )
  const [selectedOrgIds, setSelectedOrgIds] = useState<Set<string>>(
    new Set(personalAccessToken?.grantedOrgIds ?? [])
  )
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(
    new Set(personalAccessToken?.grantedTeamIds ?? [])
  )
  const [expandedOrgIds, setExpandedOrgIds] = useState<Set<string>>(new Set())

  const [pageGrantMode, setPageGrantMode] = useState<GrantModeOption>(
    personalAccessToken?.grantedPageIds !== null &&
      personalAccessToken?.grantedPageIds !== undefined
      ? 'custom'
      : 'all'
  )
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(
    new Set(personalAccessToken?.grantedPageIds ?? [])
  )
  const [selectedPagesMap, setSelectedPagesMap] = useState<Map<string, PageResult>>(new Map())

  const [createdToken, setCreatedToken] = useState<string | null>(null)

  const toggleScope = (scope: OAuthScopeEnum, pairedRead?: OAuthScopeEnum) => {
    setSelectedScopes((prev) => {
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

  const toggleExpandOrg = (orgId: string) => {
    setExpandedOrgIds((prev) => {
      const next = new Set(prev)
      if (next.has(orgId)) next.delete(orgId)
      else next.add(orgId)
      return next
    })
  }

  const togglePage = (page: PageResult) => {
    setSelectedPageIds((prev) => {
      const next = new Set(prev)
      if (next.has(page.id)) {
        next.delete(page.id)
        setSelectedPagesMap((m) => {
          const nm = new Map(m)
          nm.delete(page.id)
          return nm
        })
      } else {
        next.add(page.id)
        setSelectedPagesMap((m) => new Map(m).set(page.id, page))
      }
      return next
    })
  }

  const computeGrantedTeamIds = (): string[] | null => {
    if (orgGrantMode !== 'custom') return null
    // Exclude teams whose org is fully covered by selectedOrgIds — the org grant suffices
    const orgTeamIds = new Set(
      viewer.organizations
        .filter((org) => selectedOrgIds.has(org.id))
        .flatMap((org) => org.teams.map((t) => t.id))
    )
    const partialTeamIds = [...selectedTeamIds].filter((id) => !orgTeamIds.has(id))
    return partialTeamIds
  }

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
    const grantedTeamIds = computeGrantedTeamIds()

    if (isEdit) {
      commitUpdate({
        variables: {
          tokenId: personalAccessToken.id,
          name: tokenName.trim(),
          scopes: [...selectedScopes] as OAuthScopeEnum[],
          grantedOrgIds: orgGrantMode === 'custom' ? [...selectedOrgIds] : null,
          grantedTeamIds,
          grantedPageIds: pageGrantMode === 'custom' ? [...selectedPageIds] : null,
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
          grantedOrgIds: orgGrantMode === 'custom' ? [...selectedOrgIds] : null,
          grantedTeamIds,
          grantedPageIds: pageGrantMode === 'custom' ? [...selectedPageIds] : null,
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
            <OrgTeamGrant
              viewerRef={viewer}
              orgGrantMode={orgGrantMode}
              setOrgGrantMode={setOrgGrantMode}
              selectedOrgIds={selectedOrgIds}
              setSelectedOrgIds={setSelectedOrgIds}
              selectedTeamIds={selectedTeamIds}
              setSelectedTeamIds={setSelectedTeamIds}
              expandedOrgIds={expandedOrgIds}
              toggleExpandOrg={toggleExpandOrg}
            />
            <PageGrant
              pageGrantMode={pageGrantMode}
              setPageGrantMode={setPageGrantMode}
              selectedPageIds={selectedPageIds}
              selectedPagesMap={selectedPagesMap}
              togglePage={togglePage}
              orgGrantMode={orgGrantMode}
              selectedOrgIds={selectedOrgIds}
              selectedTeamIds={selectedTeamIds}
            />
          </div>
        </div>
        <DialogActions>
          <Button variant='outline' size='md' onClick={onClose}>
            Cancel
          </Button>
          <Button variant='primary' size='md' onClick={handleSubmit} disabled={submitting}>
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
