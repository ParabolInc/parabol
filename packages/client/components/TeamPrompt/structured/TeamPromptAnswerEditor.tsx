import type {Editor} from '@tiptap/core'
import type {JSONContent} from '@tiptap/react'
import {useState} from 'react'
import {Check} from '~/ui/icons'
import {cn} from '../../../ui/cn'
import {isOSX} from '../../../utils/platform'
import PromptResponseEditor from '../PromptResponseEditor'

interface Props {
  teamId: string
  prompt: {id: string; question: string; description: string; groupColor: string}
  initialContent: JSONContent | null
  readOnly: boolean
  isAnswered: boolean
  compact: boolean
  onChange: (promptId: string, editor: Editor) => void
  onModEnter: () => void
  onTab?: () => void
  editorRef: React.MutableRefObject<Editor | null>
}

const TeamPromptAnswerEditor = (props: Props) => {
  const {
    teamId,
    prompt,
    initialContent,
    readOnly,
    isAnswered,
    compact,
    onChange,
    onModEnter,
    onTab,
    editorRef
  } = props
  const [isFocused, setIsFocused] = useState(false)
  const linkShortcut = isOSX ? '⌘K' : 'Ctrl+K'
  return (
    <div className='flex flex-col gap-1.5'>
      <div className='flex items-center gap-2 font-semibold text-[13px] text-fg-secondary'>
        <span
          className='h-2.5 w-2.5 shrink-0 rounded-full'
          style={{background: prompt.groupColor}}
        />
        <span className='flex-1'>{prompt.question}</span>
        {isAnswered && <Check className='h-4 w-4 text-jade-600' aria-label='Answered' />}
      </div>
      <div
        className={cn(
          'relative rounded-md border border-solid bg-surface-input transition-colors',
          isFocused ? 'border-accent' : 'border-hairline-field'
        )}
      >
        <PromptResponseEditor
          autoFocus={false}
          teamId={teamId}
          content={initialContent}
          readOnly={readOnly}
          placeholder={prompt.description || 'Write your answer'}
          showActions={false}
          enableSlashCommands
          showListControls
          onChange={(editor) => onChange(prompt.id, editor)}
          onModEnter={onModEnter}
          onTab={onTab}
          onFocusChange={setIsFocused}
          editorRef={editorRef}
          className={cn(
            'max-h-[280px] overflow-auto p-[10px_12px_6px] text-sm leading-6',
            compact
              ? isFocused
                ? 'min-h-[160px]'
                : 'min-h-[120px]'
              : isFocused
                ? 'min-h-[112px]'
                : 'min-h-[88px]'
          )}
        />
        {isFocused && !readOnly && (
          <div className='pointer-events-none px-3 pb-1.5 text-right text-[11px] text-fg-muted'>
            Select text to format · - starts a list · {linkShortcut} for a link
          </div>
        )}
      </div>
    </div>
  )
}

export default TeamPromptAnswerEditor
