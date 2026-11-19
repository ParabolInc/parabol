import type {Editor} from '@tiptap/core'
import type {CSSProperties, MouseEvent} from 'react'
import {ArrowForward, ContentCopy, DeleteOutlined, MoreHoriz} from '~/ui/icons'
import useAtmosphere from '../../hooks/useAtmosphere'
import {openMoveToPageMenu} from '../../tiptap/blockMove/openMoveToPageMenu'
import {getSelectedBlockRange} from '../../tiptap/blockSelection/blockSelectionState'
import {deleteBlocks, duplicateBlocks} from '../../tiptap/extensions/BlockSelection'
import {Button} from '../../ui/Button/Button'
import {cn} from '../../ui/cn'
import plural from '../../utils/plural'

interface Props {
  editor: Editor
  pageId: string
  count: number
  className?: string
  style?: CSSProperties
}

const BUTTON_CLASS = 'gap-1.5 px-2.5 text-fg-primary text-sm'
const ICON_CLASS = 'size-4'

export const BlockSelectionBar = (props: Props) => {
  const {editor, pageId, count, className, style} = props
  const atmosphere = useAtmosphere()

  const runOnSelection = (command: typeof deleteBlocks) => {
    const range = getSelectedBlockRange(editor.state)
    if (range) command({editor, range})
    editor.commands.focus()
  }

  const handleMoveTo = (e: MouseEvent<HTMLButtonElement>) => {
    const range = getSelectedBlockRange(editor.state)
    if (!range) return
    const {top, left, width, height} = e.currentTarget.getBoundingClientRect()
    openMoveToPageMenu({editor, range, anchorRect: {top, left, width, height}, pageId, atmosphere})
  }

  const handleMore = (e: MouseEvent<HTMLButtonElement>) => {
    editor.storage.PageDragHandle?.toggleSelectionMenu?.(editor, e.currentTarget)
  }

  return (
    <div
      role='toolbar'
      aria-label='Selected blocks'
      className={cn(
        'absolute z-10 flex items-center gap-0.5 whitespace-nowrap rounded-md bg-surface-modal p-[3px] shadow-[var(--shadow-card-raised)]',
        className
      )}
      style={style}
      onMouseDown={(e) => e.preventDefault()}
    >
      <span className='mr-0.5 border-hairline border-r pr-2.5 pl-2 font-semibold text-fg-primary text-sm leading-7'>
        {count} {plural(count, 'block')}
      </span>
      <Button variant='flat' size='sm' className={BUTTON_CLASS} onClick={handleMoveTo}>
        <ArrowForward className={ICON_CLASS} />
        Move to…
      </Button>
      <Button
        variant='flat'
        size='sm'
        className={BUTTON_CLASS}
        onClick={() => runOnSelection(duplicateBlocks)}
      >
        <ContentCopy className={ICON_CLASS} />
        Duplicate
      </Button>
      <Button
        variant='flat'
        size='sm'
        className={BUTTON_CLASS}
        onClick={() => runOnSelection(deleteBlocks)}
      >
        <DeleteOutlined className={ICON_CLASS} />
        Delete
      </Button>
      <Button
        variant='flat'
        size='sm'
        shape='icon'
        className='px-0 text-fg-primary'
        aria-label='More actions'
        onClick={handleMore}
      >
        <MoreHoriz className='size-5' />
      </Button>
    </div>
  )
}
