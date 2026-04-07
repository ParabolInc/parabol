import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import * as Popover from '@radix-ui/react-popover'
import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'
import {DayPicker} from 'react-day-picker'
import {fetchQuery, useRelayEnvironment} from 'react-relay'
import type {PersonalAccessTokenCreateDialogPagesQuery} from '../../../__generated__/PersonalAccessTokenCreateDialogPagesQuery.graphql'
import type {OAuthScopeEnum} from '../../../__generated__/useCreatePersonalAccessTokenMutation.graphql'
import BasicInput from '../../../components/InputField/BasicInput'
import {useCreatePersonalAccessToken} from '../../../mutations/useCreatePersonalAccessToken'
import {Dialog} from '../../../ui/Dialog/Dialog'
import {DialogContent} from '../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../ui/Dialog/DialogTitle'
import {type Org, OrgTeamGrant} from './OrgTeamGrant'
import {PageGrant, type PageResult} from './PageGrant'
import {TokenScopesTable} from './TokenScopesTable'

const pagesQuery = graphql`
  query PersonalAccessTokenCreateDialogPagesQuery($textFilter: String!) {
    viewer {
      pages(first: 20, textFilter: $textFilter) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  }
`

const today = new Date()
const maxExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
const formatDate = (date: Date) =>
  date.toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'})

interface Props {
  isOpen: boolean
  onClose: () => void
  orgs: ReadonlyArray<Org>
}

const PersonalAccessTokenCreateDialog = ({isOpen, onClose, orgs}: Props) => {
  const environment = useRelayEnvironment()
  const [commitCreate, submitting] = useCreatePersonalAccessToken()

  const [label, setLabel] = useState('')
  const [expiresAt, setExpiresAt] = useState<Date>(maxExpiresAt)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [selectedScopes, setSelectedScopes] = useState<Set<OAuthScopeEnum>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const [orgGrantMode, setOrgGrantMode] = useState<'all' | 'custom'>('all')
  const [selectedOrgIds, setSelectedOrgIds] = useState<Set<string>>(new Set())
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(new Set())
  const [expandedOrgIds, setExpandedOrgIds] = useState<Set<string>>(new Set())

  const [pageGrantMode, setPageGrantMode] = useState<'all' | 'custom'>('all')
  const [pageSearch, setPageSearch] = useState('')
  const [pageResults, setPageResults] = useState<PageResult[]>([])
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set())
  const [selectedPagesMap, setSelectedPagesMap] = useState<Map<string, PageResult>>(new Map())

  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen || pageGrantMode !== 'custom') return
    const subscription = fetchQuery<PersonalAccessTokenCreateDialogPagesQuery>(
      environment,
      pagesQuery,
      {textFilter: pageSearch}
    ).subscribe({
      next: (data) => {
        const pages = (data.viewer?.pages?.edges ?? [])
          .map((e) => e?.node)
          .filter((n): n is PageResult => n != null)
        setPageResults(pages)
      }
    })
    return () => subscription.unsubscribe()
  }, [pageSearch, pageGrantMode, isOpen, environment])

  const resetForm = () => {
    setLabel('')
    setExpiresAt(maxExpiresAt)
    setDatePickerOpen(false)
    setSelectedScopes(new Set())
    setError(null)
    setOrgGrantMode('all')
    setSelectedOrgIds(new Set())
    setSelectedTeamIds(new Set())
    setExpandedOrgIds(new Set())
    setPageGrantMode('all')
    setPageSearch('')
    setPageResults([])
    setSelectedPageIds(new Set())
    setSelectedPagesMap(new Map())
    setCreatedToken(null)
    setCopied(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

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

  const toggleOrg = (org: Org) => {
    const orgTeamIds = org.teams.map((t) => t.id)
    setSelectedOrgIds((prevOrgs) => {
      const nextOrgs = new Set(prevOrgs)
      setSelectedTeamIds((prevTeams) => {
        const nextTeams = new Set(prevTeams)
        if (nextOrgs.has(org.id)) {
          nextOrgs.delete(org.id)
          orgTeamIds.forEach((id) => nextTeams.delete(id))
        } else {
          nextOrgs.add(org.id)
          orgTeamIds.forEach((id) => nextTeams.add(id))
        }
        return nextTeams
      })
      return nextOrgs
    })
  }

  const toggleTeam = (teamId: string, org: Org) => {
    setSelectedTeamIds((prevTeams) => {
      const nextTeams = new Set(prevTeams)
      if (nextTeams.has(teamId)) {
        nextTeams.delete(teamId)
        setSelectedOrgIds((prev) => {
          const next = new Set(prev)
          next.delete(org.id)
          return next
        })
      } else {
        nextTeams.add(teamId)
        const allSelected = org.teams.every((t) => t.id === teamId || nextTeams.has(t.id))
        if (allSelected) setSelectedOrgIds((prev) => new Set([...prev, org.id]))
      }
      return nextTeams
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
    commitCreate({
      variables: {
        label: label.trim(),
        scopes: [...selectedScopes] as OAuthScopeEnum[],
        grantedOrgIds: orgGrantMode === 'custom' ? [...selectedOrgIds] : null,
        grantedTeamIds: orgGrantMode === 'custom' ? [...selectedTeamIds] : null,
        grantedPageIds: pageGrantMode === 'custom' ? [...selectedPageIds] : null,
        expiresAt: expiresAt.toISOString()
      },
      onCompleted: (response) => setCreatedToken(response.createPersonalAccessToken.token),
      onError: (err) => setError(err.message)
    })
  }

  const handleCopy = () => {
    if (!createdToken) return
    navigator.clipboard.writeText(createdToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const orgEnabled =
    selectedScopes.has('TEAMS_READ') ||
    selectedScopes.has('TEAMS_WRITE') ||
    selectedScopes.has('ORG_READ') ||
    selectedScopes.has('ORG_WRITE')
  const pageEnabled = selectedScopes.has('PAGES_READ') || selectedScopes.has('PAGES_WRITE')

  if (createdToken) {
    return (
      <Dialog isOpen={isOpen} onClose={handleClose}>
        <DialogContent className='flex flex-col gap-4'>
          <DialogTitle>Token Created</DialogTitle>
          <p className='text-slate-600 text-sm'>
            Copy your new token now — it won't be shown again.
          </p>
          <div className='flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-3'>
            <code className='flex-1 break-all font-mono text-slate-800 text-sm'>
              {createdToken}
            </code>
            <button
              onClick={handleCopy}
              className='shrink-0 rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              title='Copy to clipboard'
            >
              <ContentCopyIcon fontSize='small' />
            </button>
          </div>
          {copied && <p className='text-green-600 text-sm'>Copied to clipboard!</p>}
          <div className='flex justify-end'>
            <button
              onClick={handleClose}
              className='rounded-md bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700'
            >
              Done
            </button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog isOpen={isOpen} onClose={handleClose}>
      <DialogContent className='flex flex-col overflow-hidden p-0!'>
        <div className='shrink-0 px-6 pt-6 pb-4'>
          <DialogTitle>New Personal Access Token</DialogTitle>
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
          <div className='flex flex-col gap-1'>
            <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
              Expiration Date
            </label>
            <Popover.Root open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <Popover.Trigger asChild>
                <button className='w-full rounded-md border border-slate-300 px-3 py-2 text-left text-slate-700 text-sm hover:border-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'>
                  {formatDate(expiresAt)}
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  align='start'
                  className='z-50 rounded-lg border border-slate-200 bg-white shadow-lg'
                >
                  <DayPicker
                    mode='single'
                    selected={expiresAt}
                    onSelect={(day) => {
                      if (day) {
                        setExpiresAt(day)
                        setDatePickerOpen(false)
                      }
                    }}
                    disabled={{before: today, after: maxExpiresAt}}
                    defaultMonth={expiresAt}
                  />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
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
              orgs={orgs}
              enabled={orgEnabled}
              orgGrantMode={orgGrantMode}
              setOrgGrantMode={setOrgGrantMode}
              selectedOrgIds={selectedOrgIds}
              selectedTeamIds={selectedTeamIds}
              expandedOrgIds={expandedOrgIds}
              toggleOrg={toggleOrg}
              toggleTeam={toggleTeam}
              toggleExpandOrg={toggleExpandOrg}
            />
            <PageGrant
              enabled={pageEnabled}
              pageGrantMode={pageGrantMode}
              setPageGrantMode={setPageGrantMode}
              pageSearch={pageSearch}
              setPageSearch={setPageSearch}
              pageResults={pageResults}
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
            onClick={handleClose}
            className='cursor-pointer rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-700 text-sm hover:bg-slate-100'
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className='cursor-pointer rounded-md bg-sky-500 px-4 py-2 text-sm text-white hover:bg-sky-600 disabled:opacity-50'
          >
            {submitting ? 'Creating…' : 'Create Token'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PersonalAccessTokenCreateDialog
