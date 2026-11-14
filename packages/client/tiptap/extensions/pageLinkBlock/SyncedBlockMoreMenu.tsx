import type {Editor} from '@tiptap/core'
import {MoreHoriz} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import {SyncedBlockMenuRoot} from './SyncedBlockMenuRoot'
import {syncedBlockBarButtonClass} from './syncedBlockBarButtonClass'
import {useReportMenuOpen} from './useReportMenuOpen'
import {useRunAfterMenuClose} from './useRunAfterMenuClose'

interface Props {
  hostEditor: Editor
  getPos: () => number | undefined
  pageCode: number
  isOriginal: boolean
  currentPageId: string | undefined
  onOpenChange: (open: boolean) => void
}

export const SyncedBlockMoreMenu = (props: Props) => {
  const {hostEditor, getPos, pageCode, isOriginal, currentPageId, onOpenChange} = props
  const [isOpen, handleOpenChange] = useReportMenuOpen(onOpenChange)
  const {runAfterClose, handleCloseAutoFocus} = useRunAfterMenuClose()
  const pos = getPos()
  return (
    <Menu
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger={
        <Button
          aria-label='More options for this synced block'
          className={syncedBlockBarButtonClass(false)}
        >
          <MoreHoriz className='text-[16px]' />
        </Button>
      }
    >
      <MenuContent align='end' sideOffset={4} onCloseAutoFocus={handleCloseAutoFocus}>
        {pos !== undefined && (
          <SyncedBlockMenuRoot
            hostEditor={hostEditor}
            pos={pos}
            pageCode={pageCode}
            isOriginal={isOriginal}
            isViewOnly={false}
            currentPageId={currentPageId}
            runAfterClose={runAfterClose}
          />
        )}
      </MenuContent>
    </Menu>
  )
}
