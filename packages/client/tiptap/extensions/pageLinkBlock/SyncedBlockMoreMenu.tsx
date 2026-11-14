import type {Editor} from '@tiptap/core'
import {MoreHoriz} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'
import {Menu} from '../../../ui/Menu/Menu'
import {SyncedBlockMenuContent} from './SyncedBlockMenuContent'
import {syncedBlockBarButtonClass} from './syncedBlockBarButtonClass'
import {useReportMenuOpen} from './useReportMenuOpen'

interface Props {
  hostEditor: Editor
  getPos: () => number | undefined
  pageCode: number
  isOriginal: boolean
  currentPageId: string | undefined
  onOpenChange: (open: boolean) => void
}

const contentProps = {align: 'end', sideOffset: 4} as const

export const SyncedBlockMoreMenu = (props: Props) => {
  const {hostEditor, getPos, pageCode, isOriginal, currentPageId, onOpenChange} = props
  const [isOpen, handleOpenChange] = useReportMenuOpen(onOpenChange)
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
      <SyncedBlockMenuContent
        hostEditor={hostEditor}
        getPos={getPos}
        pageCode={pageCode}
        isOriginal={isOriginal}
        isViewOnly={false}
        isMounted
        currentPageId={currentPageId}
        onClose={() => handleOpenChange(false)}
        contentProps={contentProps}
      />
    </Menu>
  )
}
