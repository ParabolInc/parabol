import {type KeyboardEvent, useRef} from 'react'
import {cn} from '../../../ui/cn'

interface Props {
  prompts: readonly {id: string; question: string; groupColor: string}[]
  counts: Record<string, number>
  activePromptId: string
  onChange: (promptId: string) => void
}

const TeamUpdatesQuestionTabs = (props: Props) => {
  const {prompts, counts, activePromptId, onChange} = props
  const tabsRef = useRef<Record<string, HTMLButtonElement | null>>({})
  const focusPrompt = (prompt: {id: string}) => {
    onChange(prompt.id)
    tabsRef.current[prompt.id]?.focus()
  }
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Home') {
      e.preventDefault()
      const firstPrompt = prompts[0]
      if (firstPrompt) focusPrompt(firstPrompt)
      return
    }
    if (e.key === 'End') {
      e.preventDefault()
      const lastPrompt = prompts[prompts.length - 1]
      if (lastPrompt) focusPrompt(lastPrompt)
      return
    }
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const idx = prompts.findIndex((prompt) => prompt.id === activePromptId)
    const nextPrompt = prompts[(idx + delta + prompts.length) % prompts.length]
    if (!nextPrompt) return
    focusPrompt(nextPrompt)
  }
  return (
    <div
      role='tablist'
      aria-label='Stand-up questions'
      onKeyDown={onKeyDown}
      className='flex flex-wrap gap-2'
    >
      {prompts.map((prompt) => {
        const isActive = prompt.id === activePromptId
        return (
          <button
            key={prompt.id}
            ref={(el) => {
              tabsRef.current[prompt.id] = el
            }}
            type='button'
            role='tab'
            id={`team-question-tab-${prompt.id}`}
            aria-selected={isActive}
            aria-controls='team-question-panel'
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(prompt.id)}
            className={cn(
              'flex h-9 items-center gap-2 rounded-full border border-solid px-4 font-semibold text-[13px]',
              isActive
                ? 'border-surface-selected bg-surface-selected text-fg-selected'
                : 'border-hairline bg-surface-card text-fg-secondary hover:bg-surface-hover'
            )}
          >
            <span
              className='h-2 w-2 shrink-0 rounded-full'
              style={{background: prompt.groupColor}}
            />
            {prompt.question}
            <span
              className={cn(
                'rounded-full px-[7px] text-[11px]',
                isActive ? 'bg-black/25 text-fg-selected' : 'bg-surface-well text-fg-secondary'
              )}
            >
              {counts[prompt.id] ?? 0}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default TeamUpdatesQuestionTabs
