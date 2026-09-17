import {type RefObject, useRef, useState} from 'react'
import useHorizontalSwipe from '~/hooks/useHorizontalSwipe'
import {KeyboardArrowLeft, KeyboardArrowRight} from '~/ui/icons'
import type {TeamUpdatesQuestionStage} from '../TeamUpdatesByQuestion'
import TeamUpdatesQuestionRow from '../TeamUpdatesQuestionRow'
import memberCardScrollTop from './memberCardScrollTop'
import TeamUpdatesQuestionChips from './TeamUpdatesQuestionChips'

interface Props {
  prompts: readonly {id: string; question: string; groupColor: string}[]
  sharedStages: readonly TeamUpdatesQuestionStage[]
  draftingStages: readonly TeamUpdatesQuestionStage[]
  isEnded: boolean
  selectedStageId: string | null
  onReply: (stageId: string) => void
  scrollContainerRef: RefObject<HTMLDivElement | null>
}

const TeamUpdatesByQuestionPhone = (props: Props) => {
  const {
    prompts,
    sharedStages,
    draftingStages,
    isEnded,
    selectedStageId,
    onReply,
    scrollContainerRef
  } = props
  const [activeId, setActiveId] = useState(prompts[0]?.id ?? '')
  const rootRef = useRef<HTMLDivElement>(null)
  const selectPrompt = (promptId: string) => {
    setActiveId(promptId)
    const container = scrollContainerRef.current
    const root = rootRef.current
    if (!container || !root) return
    container.scrollTo({
      top: memberCardScrollTop({
        containerScrollTop: container.scrollTop,
        containerTop: container.getBoundingClientRect().top,
        cardTop: root.getBoundingClientRect().top,
        offset: 0
      }),
      behavior: 'smooth'
    })
  }
  const activeIndex = Math.max(
    0,
    prompts.findIndex((prompt) => prompt.id === activeId)
  )
  const step = (delta: number) => {
    const next = prompts[(activeIndex + delta + prompts.length) % prompts.length]
    if (next) selectPrompt(next.id)
  }
  const swipeHandlers = useHorizontalSwipe({
    onSwipeLeft: () => step(1),
    onSwipeRight: () => step(-1)
  })
  const activePrompt = prompts[activeIndex]
  if (!activePrompt) return null
  const answeringStages = sharedStages.filter((stage) =>
    stage.response?.answers.some((answer) => answer.promptId === activePrompt.id)
  )
  return (
    <div ref={rootRef}>
      <TeamUpdatesQuestionChips
        prompts={prompts}
        activePromptId={activePrompt.id}
        onChange={selectPrompt}
      />
      <div
        {...swipeHandlers}
        role='tabpanel'
        tabIndex={0}
        id='team-question-phone-panel'
        aria-labelledby={`team-question-phone-tab-${activePrompt.id}`}
        className='flex touch-pan-y touch-pinch-zoom flex-col gap-3 px-4 pb-2 focus-visible:outline-none'
      >
        <div className='flex items-center gap-2 pt-1 pb-1'>
          <span
            className='h-2.5 w-2.5 shrink-0 rounded-full'
            style={{background: activePrompt.groupColor}}
          />
          <h3 className='m-0 font-semibold text-base'>{activePrompt.question}</h3>
        </div>
        {answeringStages.length === 0 && (
          <div className='text-fg-primary text-sm'>No one has answered this yet.</div>
        )}
        {answeringStages.map((stage) => (
          <TeamUpdatesQuestionRow
            key={stage.id}
            stageRef={stage}
            prompt={activePrompt}
            isDrafting={false}
            isEnded={isEnded}
            isSelected={selectedStageId === stage.id}
            promptCount={prompts.length}
            onReply={onReply}
            isPhone
          />
        ))}
        {draftingStages.map((stage) => (
          <TeamUpdatesQuestionRow
            key={stage.id}
            stageRef={stage}
            prompt={activePrompt}
            isDrafting
            isEnded={isEnded}
            isSelected={false}
            promptCount={prompts.length}
            onReply={onReply}
            isPhone
          />
        ))}
        {prompts.length > 1 && (
          <div className='flex items-center justify-center gap-1 py-3 text-fg-muted text-xs'>
            <KeyboardArrowLeft className='h-4 w-4' />
            Swipe between questions
            <KeyboardArrowRight className='h-4 w-4' />
          </div>
        )}
      </div>
    </div>
  )
}

export default TeamUpdatesByQuestionPhone
