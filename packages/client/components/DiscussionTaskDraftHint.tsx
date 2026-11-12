import type {Editor} from '@tiptap/core'
import {useEditorState} from '@tiptap/react'
import isCaretInPlainLine from '../utils/isCaretInPlainLine'
import {modEnter} from '../utils/platform'

interface Props {
  editor: Editor
  onCreate: () => void
}

const DiscussionTaskDraftHint = (props: Props) => {
  const {editor, onCreate} = props
  const isInPlainLine = useEditorState({
    editor,
    selector: ({editor}) => editor.isDestroyed || isCaretInPlainLine(editor)
  })
  return (
    <div className='mt-2 text-fg-muted text-xs'>
      Press{' '}
      <button type='button' className='font-semibold text-accent' onClick={onCreate}>
        {isInPlainLine ? 'Enter' : modEnter}
      </button>{' '}
      to create the task · Esc cancels
    </div>
  )
}

export default DiscussionTaskDraftHint
