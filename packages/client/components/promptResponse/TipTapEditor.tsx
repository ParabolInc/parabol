import {Editor, EditorContent, type EditorContentProps} from '@tiptap/react'
import {cn} from '../../ui/cn'
import {StandardBubbleMenu} from './StandardBubbleMenu'
import TipTapLinkMenu from './TipTapLinkMenu'

interface Props extends EditorContentProps {
  editor: Editor
  showBubbleMenu?: boolean
  useLinkEditor?: () => void
}
export const TipTapEditor = (props: Props) => {
  const {className, editor, showBubbleMenu, useLinkEditor, ref, ...rest} = props
  return (
    <>
      <StandardBubbleMenu editor={editor} />
      <TipTapLinkMenu editor={editor} useLinkEditor={useLinkEditor} />
      <EditorContent
        ref={ref as any}
        {...rest}
        editor={editor}
        className={cn('min-h-6 text-sm', className)}
      />
    </>
  )
}
