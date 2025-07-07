import {ArrowBack, ArrowDownward, ArrowForward, ArrowUpward} from '@mui/icons-material'
import {BubbleMenu, Editor} from '@tiptap/react'
import {cn} from '../ui/cn'
import {BubbleMenuButton} from './promptResponse/BubbleMenuButton'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  editor: Editor
}
export const TipTapTableBubbleMenu = (props: Props) => {
  const {editor} = props
  const shouldShowBubbleMenu = () => {
    if (!editor || !editor.isActive('tableCell')) {
      return false
    }
    return true
  }

  const shouldShow = shouldShowBubbleMenu()

  // wrapping in div is necessary, https://github.com/ueberdosis/tiptap/issues/3784
  return (
    <div>
      <BubbleMenu
        editor={editor}
        tippyOptions={{duration: 100, role: 'dialog'}}
        shouldShow={shouldShowBubbleMenu}
      >
        <div
          className={cn(
            'items-center rounded-sm border-[1px] border-solid border-slate-600 bg-white p-[3px]',
            shouldShow ? 'flex' : 'hidden' // hide this if not active or dnd height gets screwed up
          )}
        >
          <BubbleMenuButton onClick={() => editor.chain().focus().addColumnBefore().run()}>
            <ArrowBack />
          </BubbleMenuButton>
          <BubbleMenuButton onClick={() => editor.chain().focus().addColumnAfter().run()}>
            <ArrowForward />
          </BubbleMenuButton>
          <BubbleMenuButton onClick={() => editor.chain().focus().addRowBefore().run()}>
            <ArrowUpward />
          </BubbleMenuButton>
          <BubbleMenuButton onClick={() => editor.chain().focus().addRowAfter().run()}>
            <ArrowDownward />
          </BubbleMenuButton>
        </div>
      </BubbleMenu>
    </div>
  )
}
