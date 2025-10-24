import DragHandle from '@tiptap/extension-drag-handle-react'
import {type Editor, EditorContent, type EditorContentProps} from '@tiptap/react'
import {cn} from '../../ui/cn'
import {StandardBubbleMenu} from './StandardBubbleMenu'
import TipTapLinkMenu from './TipTapLinkMenu'

interface Props extends EditorContentProps {
  editor: Editor
  showBubbleMenu?: boolean
  useLinkEditor?: () => void
  showDragHandle?: boolean
}
export const TipTapEditor = (props: Props) => {
  const {className, editor, showBubbleMenu, useLinkEditor, ref, showDragHandle, ...rest} = props
  return (
    <>
      <StandardBubbleMenu editor={editor} />
      <TipTapLinkMenu editor={editor} useLinkEditor={useLinkEditor} />
      <DragHandle editor={editor}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth='1.5'
          stroke='currentColor'
        >
          <path strokeLinecap='round' strokeLinejoin='round' d='M3.75 9h16.5m-16.5 6.75h16.5' />
        </svg>
      </DragHandle>
      <EditorContent
        ref={ref as any}
        {...rest}
        editor={editor}
        className={cn('min-h-6 text-sm', className)}
      />
    </>
  )
}
