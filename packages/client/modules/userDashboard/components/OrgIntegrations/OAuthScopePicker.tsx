import SearchIcon from '@mui/icons-material/Search'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {useMemo, useState} from 'react'
import {cn} from '../../../../ui/cn'
import {MenuContent} from '../../../../ui/Menu/MenuContent'
import {MenuItemCheckbox} from '../../../../ui/Menu/MenuItemCheckbox'
import {
  isAllReadSelected,
  isAllWriteSelected,
  SCOPE_GROUPS,
  SCOPE_IMPLIES,
  SCOPE_METADATA,
  SCOPE_REQUIRED_BY
} from './scopeMetadata'

interface OAuthScopePickerProps {
  selectedScopes: string[]
  onScopesChange: (scopes: string[]) => void
}

const getScopeSummary = (scopes: string[]) => {
  if (scopes.length === 0) return null
  // Only count individual scopes, not convenience scopes
  const individual = scopes.filter((s) => s !== 'read' && s !== 'write')
  const count = individual.length
  const readCount = individual.filter((s) => s.endsWith('_read')).length
  const writeCount = individual.filter((s) => s.endsWith('_write')).length
  const adminCount = individual.filter((s) => s.endsWith('_admin')).length
  const parts: string[] = []
  if (readCount > 0) parts.push(`${readCount} read`)
  if (writeCount > 0) parts.push(`${writeCount} write`)
  if (adminCount > 0) parts.push(`${adminCount} admin`)
  return {count, breakdown: parts.join(', ')}
}

const OAuthScopePicker = ({selectedScopes, onScopesChange}: OAuthScopePickerProps) => {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const handleToggleScope = (scope: string) => {
    const isSelected = selectedScopes.includes(scope)
    let next: string[]
    if (isSelected) {
      // Deselecting: also remove any scopes that require this one
      const toRemove = new Set([scope])
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
      // Selecting: also add any scopes this one implies
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

  // Determine checked state for convenience scopes
  const getChecked = (scope: string) => {
    if (scope === 'read') return isAllReadSelected(selectedScopes)
    if (scope === 'write') return isAllWriteSelected(selectedScopes)
    return selectedScopes.includes(scope)
  }

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
                  // Prevent the dropdown from closing when typing
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Scrollable scope list */}
            <div className='flex-1 overflow-y-auto'>
              {filteredGroups.map(({group, scopes}, groupIdx) => (
                <div key={group.key}>
                  {/* Divider between quick-select and resource groups */}
                  {groupIdx === 1 && filteredGroups[0]?.group.key === 'quick-select' && (
                    <div className='mx-3 border-slate-100 border-t' />
                  )}
                  <div className='px-3 pt-2 pb-1'>
                    <div className='font-semibold text-slate-400 text-xs uppercase tracking-wider'>
                      {group.label}
                    </div>
                  </div>
                  {scopes.map((scopeInfo) => {
                    const checked = getChecked(scopeInfo.scope)
                    const isConvenience = scopeInfo.group === 'quick-select'
                    return (
                      <MenuItemCheckbox
                        key={scopeInfo.scope}
                        checked={checked}
                        onClick={() => handleToggleScope(scopeInfo.scope)}
                      >
                        <div>
                          <div className={cn(isConvenience ? 'text-sm' : 'font-mono text-xs')}>
                            {scopeInfo.label}
                          </div>
                          <div className='text-slate-400 text-xs leading-tight'>
                            {scopeInfo.description}
                          </div>
                        </div>
                      </MenuItemCheckbox>
                    )
                  })}
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
