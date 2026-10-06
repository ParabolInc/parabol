import type {Editor} from '@tiptap/core'
import {useEditorState} from '@tiptap/react'
import {cn} from '../../ui/cn'

interface Props {
  editor: Editor
  limit: number
}

const PromptResponseCharacterCount = ({editor, limit}: Props) => {
  const characterCount = useEditorState({
    editor,
    selector: ({editor}) => editor.storage.characterCount.characters()
  })
  const isAtLimit = characterCount >= limit
  return (
    <div
      className={cn(
        'pointer-events-none absolute right-2 bottom-1 rounded-sm bg-surface-input px-1 text-xs tabular-nums',
        isAtLimit ? 'font-semibold text-fg-error' : 'text-fg-muted'
      )}
    >
      {characterCount}/{limit}
      <span className='sr-only' role='status'>
        {isAtLimit ? 'Character limit reached' : ''}
      </span>
    </div>
  )
}

export default PromptResponseCharacterCount
