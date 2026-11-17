import {type ChangeEvent, type KeyboardEvent, useState} from 'react'
import {Button} from '../ui/Button/Button'
import {cn} from '../ui/cn'
import {Check} from '../ui/icons'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import {MenuSearch} from '../ui/Menu/MenuSearch'
import type ScopePhaseTab from './ScopePhaseTab'

interface Props {
  tabs: readonly ScopePhaseTab[]
  onPick: (key: string) => void
}

const ScopePhaseTabMenuContent = ({tabs, onPick}: Props) => {
  const [query, setQuery] = useState('')
  const [movedCursor, setMovedCursor] = useState<number | null>(null)
  const needle = query.trim().toLowerCase()
  const matches = tabs.filter(({title, keywords}) =>
    [title, ...keywords].join(' ').toLowerCase().includes(needle)
  )
  const lastRow = matches.length - 1
  const firstRow = needle ? 0 : null
  const cursor = movedCursor === null ? firstRow : Math.min(movedCursor, lastRow)

  const changeQuery = (nextQuery: string) => {
    setQuery(nextQuery)
    setMovedCursor(null)
  }

  const onFilterKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      const step = event.key === 'ArrowDown' ? 1 : -1
      setMovedCursor(Math.min(Math.max((cursor ?? -step) + step, 0), lastRow))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      const row = cursor === null ? undefined : matches[cursor]
      if (row) onPick(row.key)
    }
  }

  return (
    <MenuContent align='end' className='max-h-96 w-[280px]'>
      <div className='pt-1' onKeyDown={onFilterKeyDown}>
        <MenuSearch
          placeholder='Filter integrations'
          onChange={(event: ChangeEvent<HTMLInputElement>) => changeQuery(event.target.value)}
          value={query}
        />
      </div>
      {matches.map((tab, idx) => (
        <MenuItem
          key={tab.key}
          className={cn('min-h-11 gap-3', idx === cursor && 'bg-surface-hover')}
          onClick={() => onPick(tab.key)}
        >
          <div className='h-6 w-6 flex-none'>{tab.icon}</div>
          <span className='min-w-0 flex-1 truncate'>{tab.title}</span>
          {tab.menuStatus === 'connected' && (
            <span className='flex items-center gap-1 text-fg-muted text-xs'>
              <Check className='size-4' />
              Connected
            </span>
          )}
          {tab.menuStatus === 'contactUs' && (
            <span className='text-fg-muted text-xs'>Contact us</span>
          )}
        </MenuItem>
      ))}
      {matches.length === 0 && (
        <div className='flex flex-col items-center gap-1 p-4 text-center text-fg-secondary text-sm'>
          <span>No integrations match “{query.trim()}”</span>
          <Button
            className='text-accent'
            onClick={() => changeQuery('')}
            onMouseDown={(event) => event.preventDefault()}
            variant='ghost'
          >
            Clear filter
          </Button>
        </div>
      )}
    </MenuContent>
  )
}

export default ScopePhaseTabMenuContent
