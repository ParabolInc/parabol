import {type Editor, EditorContent, type EditorContentProps} from '@tiptap/react'
import {cn} from '../../ui/cn'
import {ImportDatabaseDialog} from './ImportDatabaseDialog'
import {StandardBubbleMenu} from './StandardBubbleMenu'
import TipTapLinkMenu from './TipTapLinkMenu'

interface Props extends EditorContentProps {
  editor: Editor
  bubbleMenuPlacement?: 'top' | 'bottom'
  showListControls?: boolean
  useLinkEditor?: () => void
}
export const TipTapEditor = (props: Props) => {
  const {className, editor, bubbleMenuPlacement, showListControls, useLinkEditor, ref, ...rest} =
    props
  return (
    <>
      <StandardBubbleMenu
        editor={editor}
        showListControls={showListControls}
        placement={bubbleMenuPlacement}
      />
      <TipTapLinkMenu editor={editor} useLinkEditor={useLinkEditor} />
      <ImportDatabaseDialog editor={editor} />
      <EditorContent
        ref={ref as any}
        {...rest}
        editor={editor}
        className={cn('min-h-6 text-sm', className)}
      />
    </>
  )
}
