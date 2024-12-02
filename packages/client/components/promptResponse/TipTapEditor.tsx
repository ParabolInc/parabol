import {Editor, EditorContent} from '@tiptap/react'
import {StandardBubbleMenu} from './StandardBubbleMenu'
import TipTapLinkMenu, {LinkMenuState} from './TipTapLinkMenu'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  editor: Editor
  linkState?: LinkMenuState
  setLinkState?: (linkState: LinkMenuState) => void
  showBubbleMenu?: boolean
  useLinkEditor?: () => void
}
export const TipTapEditor = (props: Props) => {
  const {editor, linkState, setLinkState, showBubbleMenu, useLinkEditor} = props
  return (
    <div className=' cursor-text px-4 text-sm leading-5'>
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
      <EditorContent editor={editor} />
    </div>
  )
}
