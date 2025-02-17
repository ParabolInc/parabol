import {Editor, EditorContent, type EditorContentProps} from '@tiptap/react'
import {StandardBubbleMenu} from 'parabol-client/components/promptResponse/StandardBubbleMenu'
import {cn} from 'parabol-client/ui/cn'
import TipTapLinkMenu from './LinkMenu'

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
        className={cn('min-h-10 px-4 text-sm leading-none', className)}
      />
    </>
  )
}
