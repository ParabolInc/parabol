import type {Editor} from '@tiptap/core'
import {BubbleMenu} from '@tiptap/react/menus'
import {Comment as CommentIcon} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'

interface Props {
  editor: Editor
}

// The standard bubble menu only shows while the page is editable, so a viewer who may comment gets this one
export const PageCommentBubbleMenu = (props: Props) => {
  const {editor} = props
  return (
    <BubbleMenu
      editor={editor}
      pluginKey='pageCommentBubbleMenu'
      shouldShow={({editor, state}) => {
        const {from, to} = state.selection
        return !editor.isEditable && state.doc.textBetween(from, to).length > 0
      }}
      options={{offset: 6, placement: 'top'}}
    >
      <div className='flex items-center rounded-sm border border-hairline bg-surface-card p-[3px]'>
        <Button
          variant='flat'
          onClick={() => editor.commands.startPageCommentDraft()}
          className='h-7 gap-1 rounded-xs px-2 text-sm hover:bg-surface-hover'
        >
          <CommentIcon className='h-[18px] w-[18px]' />
          Comment
        </Button>
      </div>
    </BubbleMenu>
  )
}
