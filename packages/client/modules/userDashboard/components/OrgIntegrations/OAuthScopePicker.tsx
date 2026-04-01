import SearchIcon from '@mui/icons-material/Search'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {useMemo, useState} from 'react'
import type {OAuthScopeEnum} from '~/__generated__/OAuthAppFormEditQuery.graphql'
import {cn} from '../../../../ui/cn'
import {MenuContent} from '../../../../ui/Menu/MenuContent'
import {MenuItemCheckbox} from '../../../../ui/Menu/MenuItemCheckbox'
import {
  ALL_READ_SCOPES,
  ALL_WRITE_SCOPES,
  SCOPE_GROUPS,
  SCOPE_IMPLIES,
  SCOPE_METADATA,
  SCOPE_REQUIRED_BY
} from './scopeMetadata'

interface OAuthScopePickerProps {
  selectedScopes: OAuthScopeEnum[]
  onScopesChange: (scopes: OAuthScopeEnum[]) => void
}

const getScopeSummary = (scopes: OAuthScopeEnum[]) => {
  if (scopes.length === 0) return null
  const count = scopes.length
  const readCount = scopes.filter((s) => s.endsWith('_READ')).length
  const writeCount = scopes.filter((s) => s.endsWith('_WRITE')).length
  const parts: string[] = []
  if (readCount > 0) parts.push(`${readCount} read`)
  if (writeCount > 0) parts.push(`${writeCount} write`)
  return {count, breakdown: parts.join(', ')}
}

const OAuthScopePicker = ({selectedScopes, onScopesChange}: OAuthScopePickerProps) => {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const handleToggleScope = (scope: OAuthScopeEnum) => {
    const isSelected = selectedScopes.includes(scope)
    let next: OAuthScopeEnum[]
    if (isSelected) {
      const toRemove = new Set([scope])
      const implies = SCOPE_IMPLIES[scope]
      if (implies) {
        for (const dep of implies) {
          toRemove.add(dep)
        }
      }
      const requiredBy = SCOPE_REQUIRED_BY[scope]
      if (requiredBy) {
        for (const dep of requiredBy) {
          if (selectedScopes.includes(dep)) {
            toRemove.add(dep)
          }
        }
      }
      next = selectedScopes.filter((s) => !toRemove.has(s))
    } else {
      const toAdd = new Set([scope])
      const implies = SCOPE_IMPLIES[scope]
      if (implies) {
        for (const dep of implies) {
          toAdd.add(dep)
        }
      }
      next = [...new Set([...selectedScopes, ...toAdd])]
    }
    onScopesChange(next)
  }

  const handleSelectAllRead = () => {
    const allSelected = ALL_READ_SCOPES.every((s) => selectedScopes.includes(s))
    if (allSelected) {
      onScopesChange(selectedScopes.filter((s) => !ALL_READ_SCOPES.includes(s)))
    } else {
      onScopesChange([...new Set([...selectedScopes, ...ALL_READ_SCOPES])])
    }
  }

  const handleSelectAllWrite = () => {
    const allSelected = ALL_WRITE_SCOPES.every((s) => selectedScopes.includes(s))
    if (allSelected) {
      onScopesChange(selectedScopes.filter((s) => !ALL_WRITE_SCOPES.includes(s)))
    } else {
      // write scopes imply their read counterparts
      const implied = ALL_WRITE_SCOPES.flatMap((s) => SCOPE_IMPLIES[s] ?? [])
      onScopesChange([...new Set([...selectedScopes, ...ALL_WRITE_SCOPES, ...implied])])
    }
  }

  const isAllReadSelected = ALL_READ_SCOPES.every((s) => selectedScopes.includes(s))
  const isAllWriteSelected = ALL_WRITE_SCOPES.every((s) => selectedScopes.includes(s))

  const filteredGroups = useMemo(() => {
    const q = search.toLowerCase().trim()
    return SCOPE_GROUPS.map((group) => {
      const groupScopes = SCOPE_METADATA.filter((s) => s.group === group.key)
      if (!q) return {group, scopes: groupScopes}
      const filtered = groupScopes.filter(
        (s) => s.label.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      )
      return {group, scopes: filtered}
    }).filter(({scopes}) => scopes.length > 0)
  }, [search])

  const summary = getScopeSummary(selectedScopes)

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          type='button'
          className={cn(
            'flex w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm',
            'hover:border-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20',
            open && 'border-sky-500 ring-2 ring-sky-500/20'
          )}
        >
          {summary ? (
            <span className='text-slate-700'>
              {summary.count} scope{summary.count === 1 ? '' : 's'}{' '}
              <span className='text-slate-400'>({summary.breakdown})</span>
            </span>
          ) : (
            <span className='text-slate-400'>Select scopes...</span>
          )}
          <span className={cn('ml-2 text-slate-400 transition-transform', open && 'rotate-180')}>
            ▾
          </span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <MenuContent
          className='overflow-hidden! z-50! max-h-[var(--radix-dropdown-menu-content-available-height,320px)] min-w-[var(--radix-dropdown-menu-trigger-width)] max-w-none!'
          align='start'
          sideOffset={4}
          collisionPadding={8}
        >
          <div className='flex flex-col overflow-hidden' style={{maxHeight: 'inherit'}}>
            {/* Search */}
            <div className='shrink-0 border-slate-100 border-b px-3 py-2'>
              <div className='flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5'>
                <SearchIcon className='text-slate-400' style={{fontSize: 16}} />
                <input
                  type='text'
                  placeholder='Filter scopes...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='w-full border-none bg-transparent text-slate-700 text-xs placeholder-slate-400 outline-none'
                  autoFocus
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Scrollable scope list */}
            <div className='flex-1 overflow-y-auto'>
              {/* Quick select */}
              {!search && (
                <div>
                  <div className='px-3 pt-2 pb-1'>
                    <div className='font-semibold text-slate-400 text-xs uppercase tracking-wider'>
                      Quick Select
                    </div>
                  </div>
                  <MenuItemCheckbox checked={isAllReadSelected} onClick={handleSelectAllRead}>
                    <div>
                      <div className='font-mono text-xs'>read</div>
                      <div className='text-slate-400 text-xs leading-tight'>
                        All read scopes across every resource
                      </div>
                    </div>
                  </MenuItemCheckbox>
                  <MenuItemCheckbox checked={isAllWriteSelected} onClick={handleSelectAllWrite}>
                    <div>
                      <div className='font-mono text-xs'>write</div>
                      <div className='text-slate-400 text-xs leading-tight'>All write scopes</div>
                    </div>
                  </MenuItemCheckbox>
                </div>
              )}

              {filteredGroups.map(({group, scopes}) => (
                <div key={group.key}>
                  <div className='px-3 pt-2 pb-1'>
                    <div className='font-semibold text-slate-400 text-xs uppercase tracking-wider'>
                      {group.label}
                    </div>
                  </div>
                  {scopes.map((scopeInfo) => (
                    <MenuItemCheckbox
                      key={scopeInfo.scope}
                      checked={selectedScopes.includes(scopeInfo.scope)}
                      onClick={() => handleToggleScope(scopeInfo.scope)}
                    >
                      <div>
                        <div className='font-mono text-xs'>{scopeInfo.label}</div>
                        <div className='text-slate-400 text-xs leading-tight'>
                          {scopeInfo.description}
                        </div>
                      </div>
                    </MenuItemCheckbox>
                  ))}
                </div>
              ))}
              {filteredGroups.length === 0 && (
                <div className='px-3 py-4 text-center text-slate-400 text-xs'>
                  No scopes match your search
                </div>
              )}
            </div>
          </div>
        </MenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default OAuthScopePicker
