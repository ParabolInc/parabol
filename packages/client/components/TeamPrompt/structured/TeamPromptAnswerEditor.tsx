import type {Editor} from '@tiptap/core'
import type {JSONContent} from '@tiptap/react'
import {useState} from 'react'
import {cn} from '../../../ui/cn'
import {isOSX} from '../../../utils/platform'
import PromptResponseEditor from '../PromptResponseEditor'
import answerEditorClassName from './answerEditorClassName'
import TeamPromptCollapsedAnswerRow from './mobile/TeamPromptCollapsedAnswerRow'
import TeamPromptAnswerLabel from './TeamPromptAnswerLabel'

interface Props {
  teamId: string
  prompt: {id: string; question: string; description: string; groupColor: string}
  initialContent: JSONContent | null
  readOnly: boolean
  isAnswered: boolean
  compact: boolean
  isPhone?: boolean
  isCollapsed?: boolean
  isFocusedBlock?: boolean
  preview?: string
  onChange: (promptId: string, editor: Editor) => void
  onModEnter: () => void
  onTab?: () => void
  onFocusPrompt?: () => void
  onFocusChange?: (isFocused: boolean) => void
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
    isPhone,
    isCollapsed,
    isFocusedBlock,
    preview,
    onChange,
    onModEnter,
    onTab,
    onFocusPrompt,
    onFocusChange,
    editorRef
  } = props
  const [isFocused, setIsFocused] = useState(false)
  const linkShortcut = isOSX ? '⌘K' : 'Ctrl+K'
  const editorClassName = answerEditorClassName({
    isPhone: !!isPhone,
    isFocusedBlock: !!isFocusedBlock,
    isFocused,
    compact
  })
  return (
    <>
      {isCollapsed && (
        <TeamPromptCollapsedAnswerRow
          prompt={prompt}
          isAnswered={isAnswered}
          preview={preview ?? ''}
          onClick={() => onFocusPrompt?.()}
        />
      )}
      <div
        className={cn(
          'flex flex-col gap-1.5',
          isCollapsed && 'hidden',
          isFocusedBlock && 'min-h-0 flex-1'
        )}
      >
        <TeamPromptAnswerLabel
          question={prompt.question}
          groupColor={prompt.groupColor}
          isAnswered={isAnswered}
        />
        <div
          className={cn(
            'relative rounded-md border border-solid bg-surface-input transition-colors',
            isFocused ? 'border-accent' : 'border-hairline-field',
            isFocusedBlock && 'flex min-h-0 flex-1 flex-col'
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
            onFocusChange={(nextIsFocused) => {
              setIsFocused(nextIsFocused)
              onFocusChange?.(nextIsFocused)
            }}
            editorRef={editorRef}
            className={editorClassName}
          />
          {!isPhone && isFocused && !readOnly && (
            <div className='pointer-events-none px-3 pb-1.5 text-right text-[11px] text-fg-muted'>
              Select text to format · - starts a list · {linkShortcut} for a link
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default TeamPromptAnswerEditor
