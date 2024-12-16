import {Link} from '@mui/icons-material'
import {BubbleMenu, Editor} from '@tiptap/react'
import {BubbleMenuButton} from './BubbleMenuButton'
import isTextSelected from './isTextSelected'
import {LinkMenuState} from './TipTapLinkMenu'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  editor: Editor
  setLinkState: (linkState: LinkMenuState) => void
}
export const StandardBubbleMenu = (props: Props) => {
  const {editor, setLinkState} = props

  const shouldShowBubbleMenu = () => {
    if (!editor || editor.isActive('link')) return false
    return isTextSelected(editor)
  }

  const openLinkEditor = () => {
    setLinkState('edit')
  }

  return (
    <BubbleMenu editor={editor} tippyOptions={{duration: 100}} shouldShow={shouldShowBubbleMenu}>
      <div className='flex items-center rounded border-[1px] border-solid border-slate-600 bg-white p-1'>
        <BubbleMenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
        >
          <b>B</b>
        </BubbleMenuButton>
        <BubbleMenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
        >
          <i>I</i>
        </BubbleMenuButton>
        <BubbleMenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
        >
          <s>S</s>
        </BubbleMenuButton>
        <BubbleMenuButton onClick={openLinkEditor}>
          <Link className='h-[18px] w-[18px]' />
        </BubbleMenuButton>
      </div>
    </BubbleMenu>
  )
}
