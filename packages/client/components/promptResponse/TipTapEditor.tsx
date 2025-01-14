import {Editor, EditorContent, type EditorContentProps} from '@tiptap/react'
import {ImageUploadMenu} from '../../tiptap/extensions/imageUpload/ImageUploadMenu'
import {cn} from '../../ui/cn'
import {StandardBubbleMenu} from './StandardBubbleMenu'
import TipTapLinkMenu, {LinkMenuState} from './TipTapLinkMenu'

interface Props extends EditorContentProps {
  editor: Editor
  linkState?: LinkMenuState
  setLinkState?: (linkState: LinkMenuState) => void
  showBubbleMenu?: boolean
  useLinkEditor?: () => void
}
export const TipTapEditor = (props: Props) => {
  const {className, editor, linkState, setLinkState, showBubbleMenu, useLinkEditor, ref, ...rest} =
    props
  return (
    <>
      {showBubbleMenu && setLinkState && (
        <StandardBubbleMenu editor={editor} setLinkState={setLinkState} />
      )}
      {setLinkState && linkState && (
        <TipTapLinkMenu
          editor={editor}
          setLinkState={(linkState: LinkMenuState) => {
            editor.commands.focus()
            setLinkState(linkState)
          }}
          linkState={linkState}
          useLinkEditor={useLinkEditor}
        />
      )}
      <ImageUploadMenu editor={editor} />
      <EditorContent
        ref={ref as any}
        {...rest}
        editor={editor}
        className={cn('min-h-10 px-4 text-sm leading-none', className)}
      />
    </>
  )
}
