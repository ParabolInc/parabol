import {Link} from '@mui/icons-material'
import type {Editor} from '@tiptap/react'
import {BubbleMenu} from '@tiptap/react/menus'
import {getShouldShow, useBubbleMenuStates} from '../../hooks/useBubbleMenuStates'
import {cn} from '../../ui/cn'
import {BubbleMenuButton} from './BubbleMenuButton'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  editor: Editor
  className?: string
  buttonClassName?: string
}
export const StandardBubbleMenu = (props: Props) => {
  const {editor, className, buttonClassName} = props
  const openLinkEditor = () => {
    editor.emit('linkStateChange', {editor, linkState: 'edit'})
  }

  const states = useBubbleMenuStates(editor)
  const {isBold, isItalic, isStrike, isUnderline, isLink} = states
  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({editor}) => {
        return getShouldShow(editor)
      }}
      className={cn(className)}
      options={{
        offset: 6,
        placement: 'top'
      }}
    >
      <div
        className={cn(
          'flex items-center rounded-sm border-[1px] border-slate-600 border-solid bg-white p-[3px]'
        )}
      >
        <BubbleMenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={isBold}
          className={cn(buttonClassName)}
        >
          <b>B</b>
        </BubbleMenuButton>
        <BubbleMenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={isItalic}
          className={cn(buttonClassName)}
        >
          <i>I</i>
        </BubbleMenuButton>
        <BubbleMenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={isUnderline}
          className={cn(buttonClassName)}
        >
          <u>U</u>
        </BubbleMenuButton>
        <BubbleMenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={isStrike}
          className={cn(buttonClassName)}
        >
          <s>S</s>
        </BubbleMenuButton>
        <BubbleMenuButton
          onClick={openLinkEditor}
          isActive={isLink}
          className={cn(buttonClassName)}
        >
          <Link className='h-[18px] w-[18px]' />
        </BubbleMenuButton>
      </div>
    </BubbleMenu>
  )
}
