import {Link} from '@mui/icons-material'
import {BubbleMenu, Editor} from '@tiptap/react'
import {BubbleMenuButton} from './BubbleMenuButton'
import isTextSelected from './isTextSelected'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  editor: Editor
}
export const StandardBubbleMenu = (props: Props) => {
  const {editor} = props
  const shouldShowBubbleMenu = () => {
    if (!editor || editor.isActive('link')) return false
    return isTextSelected(editor)
  }

  const openLinkEditor = () => {
    editor.emit('linkStateChange', {editor, linkState: 'edit'})
  }

  // wrapping in div is necessary, https://github.com/ueberdosis/tiptap/issues/3784
  return (
    <div>
      <BubbleMenu
        editor={editor}
        tippyOptions={{duration: 100, role: 'dialog'}}
        shouldShow={shouldShowBubbleMenu}
      >
        <div className='flex items-center rounded-sm border-[1px] border-solid border-slate-600 bg-white p-[3px]'>
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
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
          >
            <u>U</u>
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
    </div>
  )
}
