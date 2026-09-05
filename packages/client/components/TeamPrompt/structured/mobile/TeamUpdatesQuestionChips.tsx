import {type KeyboardEvent, useEffect, useRef} from 'react'
import {cn} from '../../../../ui/cn'
import radioGroupNextValue from '../radioGroupNextValue'
import shortPromptLabel from './shortPromptLabel'

interface Props {
  prompts: readonly {id: string; question: string; groupColor: string}[]
  activePromptId: string
  onChange: (promptId: string) => void
}

const CHIP =
  'relative flex h-9 shrink-0 items-center gap-2 rounded-full border border-solid px-3 font-semibold text-sm after:-top-1.5 after:-bottom-1.5 after:absolute after:inset-x-0 after:content-[""]'

const TeamUpdatesQuestionChips = (props: Props) => {
  const {prompts, activePromptId, onChange} = props
  const listRef = useRef<HTMLDivElement>(null)
  const chipsRef = useRef<Record<string, HTMLButtonElement | null>>({})
  useEffect(() => {
    const chip = chipsRef.current[activePromptId]
    const list = listRef.current
    if (!chip || !list) return
    const left = chip.offsetLeft - (list.clientWidth - chip.clientWidth) / 2
    list.scrollTo({left: Math.max(0, left), behavior: 'smooth'})
  }, [activePromptId])
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = radioGroupNextValue(
      prompts.map((prompt) => prompt.id),
      activePromptId,
      e.key
    )
    if (!next) return
    e.preventDefault()
    onChange(next)
    chipsRef.current[next]?.focus()
  }
  if (prompts.length === 0) return null
  return (
    <div
      ref={listRef}
      role='tablist'
      aria-label='Stand-up questions'
      onKeyDown={onKeyDown}
      className='sticky top-0 z-10 flex gap-2 overflow-x-auto bg-surface-app px-4 pt-1.5 pb-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
    >
      {prompts.map((prompt) => {
        const isActive = prompt.id === activePromptId
        return (
          <button
            key={prompt.id}
            ref={(el) => {
              chipsRef.current[prompt.id] = el
            }}
            type='button'
            role='tab'
            id={`team-question-phone-tab-${prompt.id}`}
            aria-controls='team-question-phone-panel'
            aria-label={prompt.question}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(prompt.id)}
            className={cn(
              CHIP,
              isActive
                ? 'border-transparent bg-surface-selected text-fg-selected'
                : 'border-hairline-strong bg-surface-card text-fg-secondary'
            )}
          >
            <span
              className='h-2 w-2 shrink-0 rounded-full'
              style={{background: prompt.groupColor}}
            />
            <span className='max-w-[140px] truncate'>{shortPromptLabel(prompt.question)}</span>
          </button>
        )
      })}
    </div>
  )
}

export default TeamUpdatesQuestionChips
