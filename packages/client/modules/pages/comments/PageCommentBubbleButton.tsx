import type {Editor} from '@tiptap/core'
import {Comment as CommentIcon} from '~/ui/icons'
import {BubbleMenuButton} from '../../../components/TipTapEditor/BubbleMenuButton'
import {modKey} from '../../../utils/platform'

interface Props {
  editor: Editor
}

export const PageCommentBubbleButton = (props: Props) => {
  const {editor} = props
  return (
    <>
      <div className='mx-[3px] h-[18px] w-px bg-hairline' />
      <BubbleMenuButton
        onClick={() => editor.commands.startPageCommentDraft()}
        title={`Comment (${modKey === '⌘' ? '⌘⌥M' : 'Ctrl+Alt+M'})`}
        aria-label='Comment'
      >
        <CommentIcon className='h-[18px] w-[18px]' />
      </BubbleMenuButton>
    </>
  )
}
