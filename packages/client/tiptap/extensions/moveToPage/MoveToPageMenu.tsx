import {Suspense, useCallback, useRef, useState} from 'react'
import {useNavigate} from 'react-router'
import {useDebouncedSearch} from '../../../hooks/useDebouncedSearch'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import {MenuSearch} from '../../../ui/Menu/MenuSearch'
import MenuSkeletonRows from '../../../ui/Menu/MenuSkeletonRows'
import menuSectionTitleClass from '../../../ui/Menu/menuSectionTitleClass'
import plural from '../../../utils/plural'
import type {BlockDragState} from '../../blockMove/getBlockDropRefusal'
import type {MoveToPageAnchorRect} from '../../blockMove/openMoveToPageMenu'
import {handleMoveToPageMenuKey} from './handleMoveToPageMenuKey'
import {isFocusableTarget} from './isFocusableTarget'
import type {MoveToPageFirstAllowed} from './MoveToPageResults'
import MoveToPageResultsRoot from './MoveToPageResultsRoot'

interface Props {
  anchorRect: MoveToPageAnchorRect
  count: number
  drag: BlockDragState
  onClose: (returnFocus: boolean) => void
  onPick: (pageId: string, title: string, navigate: (path: string) => void) => void
}

const MoveToPageMenu = (props: Props) => {
  const {anchorRect, count, drag, onClose, onPick} = props
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const {debouncedSearch} = useDebouncedSearch(search, 150)
  const firstAllowedRef = useRef<MoveToPageFirstAllowed | null>(null)
  const setFirstAllowed = useCallback((first: MoveToPageFirstAllowed) => {
    firstAllowedRef.current = first
  }, [])
  const returnFocusRef = useRef(true)
  const pick = (pageId: string, title: string) => onPick(pageId, title, navigate)
  const pickFirst = () => {
    const {row, textFilter} = firstAllowedRef.current ?? {}
    if (row && textFilter === search.trim()) pick(row.pageId, row.title)
  }
  const appendToSearch = (text: string) => setSearch((value) => value + text)

  return (
    <Menu
      open
      modal={false}
      onOpenChange={(open) => {
        if (!open) queueMicrotask(() => onClose(returnFocusRef.current))
      }}
      trigger={
        <button
          className='pointer-events-none fixed opacity-0'
          style={anchorRect}
          tabIndex={-1}
          aria-hidden
        />
      }
    >
      <MenuContent
        align='start'
        sideOffset={4}
        collisionPadding={8}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onKeyDown={(e) => handleMoveToPageMenuKey(e, {pickFirst, appendToSearch})}
        onPointerDownOutside={(e) => {
          returnFocusRef.current = !isFocusableTarget(e.detail.originalEvent.target)
        }}
        onFocusOutside={() => {
          returnFocusRef.current = false
        }}
        className='z-50 flex max-h-96 w-80 flex-col overflow-hidden py-0'
      >
        <div className={menuSectionTitleClass}>
          Move {count} {plural(count, 'block')} to
        </div>
        <MenuSearch
          placeholder='Search pages'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='shrink-0'
        />
        <div className='min-h-0 overflow-auto py-1'>
          <Suspense fallback={<MenuSkeletonRows count={4} />}>
            <MoveToPageResultsRoot
              textFilter={debouncedSearch.trim()}
              drag={drag}
              onPick={pick}
              onFirstAllowed={setFirstAllowed}
            />
          </Suspense>
        </div>
        <div className='shrink-0 border-hairline border-t px-4 py-2 text-fg-muted text-xs'>
          ↑ ↓ choose · Enter move · Esc close
        </div>
      </MenuContent>
    </Menu>
  )
}

export default MoveToPageMenu
