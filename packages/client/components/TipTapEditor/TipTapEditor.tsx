import {type Editor, EditorContent, type EditorContentProps} from '@tiptap/react'
import useCoarsePointer from '../../hooks/useCoarsePointer'
import {cn} from '../../ui/cn'
import {ImportDatabaseDialog} from './ImportDatabaseDialog'
import {StandardBubbleMenu} from './StandardBubbleMenu'
import TipTapLinkMenu from './TipTapLinkMenu'

interface Props extends EditorContentProps {
  editor: Editor
  showBubbleMenu?: boolean
  showListControls?: boolean
  useLinkEditor?: () => void
}
export const TipTapEditor = (props: Props) => {
  const {className, editor, showBubbleMenu, showListControls, useLinkEditor, ref, ...rest} = props
  const isCoarsePointer = useCoarsePointer()
  return (
    <>
      <StandardBubbleMenu
        editor={editor}
        showListControls={showListControls}
        offset={isCoarsePointer ? 12 : 6}
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
