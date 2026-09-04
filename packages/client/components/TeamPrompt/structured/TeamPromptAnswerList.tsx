import type {Editor} from '@tiptap/core'
import type {JSONContent} from '@tiptap/react'
import {cn} from '../../../ui/cn'
import answerPreview from './mobile/answerPreview'
import type useComposerFocusMode from './mobile/useComposerFocusMode'
import TeamPromptAnswerEditor from './TeamPromptAnswerEditor'

interface Props {
  teamId: string
  prompts: readonly {id: string; question: string; description: string; groupColor: string}[]
  initialContentByPrompt: ReadonlyMap<string, JSONContent | null>
  savedTextByPrompt: ReadonlyMap<string, string>
  answeredPromptIds: ReadonlySet<string>
  editorRefs: React.MutableRefObject<Map<string, React.MutableRefObject<Editor | null>>>
  readOnly: boolean
  isPhone: boolean
  focusMode: ReturnType<typeof useComposerFocusMode>
  onChange: (promptId: string, editor: Editor) => void
  onModEnter: () => void
}

const TeamPromptAnswerList = (props: Props) => {
  const {
    teamId,
    prompts,
    initialContentByPrompt,
    savedTextByPrompt,
    answeredPromptIds,
    editorRefs,
    readOnly,
    isPhone,
    focusMode,
    onChange,
    onModEnter
  } = props
  const {focusedPromptId} = focusMode
  return (
    <div
      className={cn(
        'flex flex-col rounded-card bg-surface-card shadow-[var(--shadow-card)]',
        isPhone ? 'gap-3.5 p-3.5' : 'gap-4 p-4',
        isPhone && focusedPromptId && 'min-h-[calc(100dvh-96px-var(--tp-keyboard,0px))]'
      )}
    >
      {prompts.map((prompt, index) => {
        if (!editorRefs.current.has(prompt.id)) editorRefs.current.set(prompt.id, {current: null})
        const nextPromptId = prompts[index + 1]?.id
        const isCollapsed = isPhone && !!focusedPromptId && focusedPromptId !== prompt.id
        return (
          <TeamPromptAnswerEditor
            key={prompt.id}
            teamId={teamId}
            prompt={prompt}
            initialContent={initialContentByPrompt.get(prompt.id) ?? null}
            readOnly={readOnly}
            isAnswered={answeredPromptIds.has(prompt.id)}
            compact={prompts.length === 1}
            onChange={onChange}
            onModEnter={onModEnter}
            onTab={
              nextPromptId
                ? () => editorRefs.current.get(nextPromptId)?.current?.commands.focus('end')
                : undefined
            }
            isPhone={isPhone}
            isCollapsed={isCollapsed}
            isFocusedBlock={isPhone && focusedPromptId === prompt.id}
            preview={
              isCollapsed
                ? answerPreview(
                    editorRefs.current.get(prompt.id)?.current,
                    savedTextByPrompt.get(prompt.id) ?? ''
                  )
                : ''
            }
            onFocusPrompt={() => focusMode.focusPrompt(prompt.id)}
            onFocusChange={(isFocused) => focusMode.onEditorFocusChange(prompt.id, isFocused)}
            editorRef={editorRefs.current.get(prompt.id)!}
          />
        )
      })}
    </div>
  )
}

export default TeamPromptAnswerList
