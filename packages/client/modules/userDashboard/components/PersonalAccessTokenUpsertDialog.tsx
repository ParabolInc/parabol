import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {PersonalAccessTokenUpsertDialog_viewer$key} from '~/__generated__/PersonalAccessTokenUpsertDialog_viewer.graphql'
import type {OAuthScopeEnum} from '../../../__generated__/useCreatePersonalAccessTokenMutation.graphql'
import BasicInput from '../../../components/InputField/BasicInput'
import {useCreatePersonalAccessToken} from '../../../mutations/useCreatePersonalAccessToken'
import {useUpdatePersonalAccessToken} from '../../../mutations/useUpdatePersonalAccessToken'
import {Dialog} from '../../../ui/Dialog/Dialog'
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
  label: string
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
      }
    `,
    viewerRef
  )

  const [label, setLabel] = useState(personalAccessToken?.label ?? '')
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

  const handleSubmit = () => {
    if (!label.trim()) {
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
          label: label.trim(),
          scopes: [...selectedScopes] as OAuthScopeEnum[],
          grantedOrgIds: orgGrantMode === 'custom' ? [...selectedOrgIds] : null,
          grantedTeamIds: orgGrantMode === 'custom' ? [...selectedTeamIds] : null,
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
        onError: (err) => setError(err.message)
      })
    } else {
      commitCreate({
        variables: {
          label: label.trim(),
          scopes: [...selectedScopes] as OAuthScopeEnum[],
          grantedOrgIds: orgGrantMode === 'custom' ? [...selectedOrgIds] : null,
          grantedTeamIds: orgGrantMode === 'custom' ? [...selectedTeamIds] : null,
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
        onError: (err) => setError(err.message)
      })
    }
  }

  if (createdToken) {
    return <PersonalAccessTokenCreateSuccess token={createdToken} onClose={onClose} />
  }

  return (
    <Dialog onClose={onClose} open>
      <DialogContent className='flex flex-col overflow-hidden p-0!'>
        <div className='shrink-0 px-6 pt-6 pb-4'>
          <DialogTitle>
            {isEdit ? 'Edit Personal Access Token' : 'New Personal Access Token'}
          </DialogTitle>
        </div>
        {error && (
          <div className='mx-6 mb-4 shrink-0 animate-shake rounded-md py-2 font-medium text-sm text-tomato-500'>
            {error}
          </div>
        )}
        <div className='flex-1 space-y-6 overflow-y-auto px-6 pb-4'>
          <div className='flex flex-col gap-1'>
            <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
              Label
            </label>
            <BasicInput
              name='label'
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder='e.g. CI pipeline token'
              className='w-full'
              error={undefined}
            />
          </div>
          <ExpirationDatePicker selected={expiresAt} onSelect={setExpiresAt} />
          <TokenScopesTable selectedScopes={selectedScopes} toggleScope={toggleScope} />
          <div className='flex flex-col gap-4'>
            <div>
              <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
                Resource Grants
              </label>
              <p className='mt-1 text-slate-500 text-xs'>
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
        <div className='flex shrink-0 justify-end gap-2 border-slate-200 border-t bg-slate-50/50 px-6 py-4'>
          <button
            onClick={onClose}
            className='cursor-pointer rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-700 text-sm hover:bg-slate-100'
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className='cursor-pointer rounded-md bg-sky-500 px-4 py-2 text-sm text-white hover:bg-sky-600 disabled:opacity-50'
          >
            {submitting
              ? isEdit
                ? 'Saving…'
                : 'Creating…'
              : isEdit
                ? 'Save Changes'
                : 'Create Token'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PersonalAccessTokenUpsertDialog
