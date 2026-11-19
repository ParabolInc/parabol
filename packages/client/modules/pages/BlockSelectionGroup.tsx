import type {Editor} from '@tiptap/core'
import {useEditorState} from '@tiptap/react'
import type {RefObject} from 'react'
import {cn} from '../../ui/cn'
import {BlockSelectionBar} from './BlockSelectionBar'
import {useBlockSelectionBox} from './useBlockSelectionBox'

interface Props {
  editor: Editor
  containerRef: RefObject<HTMLElement | null>
  pageId: string
}

const PAD_X = 12
const PAD_Y = 6
const BAR_GAP = 8
const BAR_ROOM = 44

export const BlockSelectionGroup = ({editor, containerRef, pageId}: Props) => {
  const box = useBlockSelectionBox(editor, containerRef)
  const isEditable = useEditorState({editor, selector: ({editor}) => editor.isEditable})
  if (!box) return null
  const top = box.top - PAD_Y
  const bottom = box.top + box.height + PAD_Y
  const left = box.left - PAD_X
  const isBarAbove = top - BAR_GAP - BAR_ROOM >= 0
  return (
    <>
      <div
        aria-hidden
        className='-z-1 pointer-events-none absolute rounded-[10px] bg-accent-active/8 ring-[1.5px] ring-accent-active/60 ring-inset dark:bg-accent-active/14'
        style={{top, left, width: box.width + PAD_X * 2, height: bottom - top}}
      />
      {isEditable && (
        <BlockSelectionBar
          editor={editor}
          pageId={pageId}
          count={box.count}
          className={cn(isBarAbove && '-translate-y-full')}
          style={{left, top: isBarAbove ? top - BAR_GAP : bottom + BAR_GAP}}
        />
      )}
    </>
  )
}
