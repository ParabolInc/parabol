import type {Editor} from '@tiptap/react'
import {BubbleMenu} from '@tiptap/react/menus'
import {FormatListBulleted, FormatListNumbered, Link} from '~/ui/icons'
import {getShouldShow, useBubbleMenuStates} from '../../hooks/useBubbleMenuStates'
import {cn} from '../../ui/cn'
import {modKey} from '../../utils/platform'
import {BubbleMenuButton} from './BubbleMenuButton'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  editor: Editor
  className?: string
  buttonClassName?: string
  showListControls?: boolean
}

const shortcut = (key: string) => `${modKey === '⌘' ? '⌘' : 'Ctrl+'}${key}`

export const StandardBubbleMenu = (props: Props) => {
  const {editor, className, buttonClassName, showListControls = false} = props
  const openLinkEditor = () => {
    editor.emit('linkStateChange', {editor, linkState: 'edit'})
  }

  const states = useBubbleMenuStates(editor)
  const {isBold, isItalic, isStrike, isUnderline, isLink, isBulletList, isOrderedList} = states
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
          'flex items-center rounded-sm border-[1px] border-hairline border-solid bg-surface-card p-[3px]'
        )}
      >
        <BubbleMenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={isBold}
          className={cn(buttonClassName)}
          title={`Bold (${shortcut('B')})`}
          aria-label='Bold'
        >
          <b>B</b>
        </BubbleMenuButton>
        <BubbleMenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={isItalic}
          className={cn(buttonClassName)}
          title={`Italic (${shortcut('I')})`}
          aria-label='Italic'
        >
          <i>I</i>
        </BubbleMenuButton>
        <BubbleMenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={isUnderline}
          className={cn(buttonClassName)}
          title={`Underline (${shortcut('U')})`}
          aria-label='Underline'
        >
          <u>U</u>
        </BubbleMenuButton>
        <BubbleMenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={isStrike}
          className={cn(buttonClassName)}
          title={`Strikethrough (${shortcut('Shift+S')})`}
          aria-label='Strikethrough'
        >
          <s>S</s>
        </BubbleMenuButton>
        <BubbleMenuButton
          onClick={openLinkEditor}
          isActive={isLink}
          className={cn(buttonClassName)}
          title={`Link (${shortcut('K')})`}
          aria-label='Link'
        >
          <Link className='h-[18px] w-[18px]' />
        </BubbleMenuButton>
        {showListControls && (
          <>
            <div className='mx-[3px] h-[18px] w-px bg-hairline' />
            <BubbleMenuButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={isBulletList}
              className={cn(buttonClassName)}
              title='Bulleted list (-)'
              aria-label='Bulleted list'
            >
              <FormatListBulleted className='h-[18px] w-[18px]' />
            </BubbleMenuButton>
            <BubbleMenuButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={isOrderedList}
              className={cn(buttonClassName)}
              title='Numbered list (1.)'
              aria-label='Numbered list'
            >
              <FormatListNumbered className='h-[18px] w-[18px]' />
            </BubbleMenuButton>
          </>
        )}
      </div>
    </BubbleMenu>
  )
}
