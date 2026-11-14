import {useRef, useState} from 'react'
import {cn} from '../../../ui/cn'
import type {TeamUpdateStage} from '../structured/TeamUpdatesByPerson'
import TeamUpdatesQuestionRow from '../structured/TeamUpdatesQuestionRow'
import {getSharedResponses} from '../structured/teamPromptStages'

interface Props {
  prompts: readonly {id: string; question: string; groupColor: string}[]
  sharedStages: readonly TeamUpdateStage[]
  isEnded: boolean
  onReply: (stageId: string) => void
}

const TeamPromptMobileByQuestion = (props: Props) => {
  const {prompts, sharedStages, isEnded, onReply} = props
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  const getPage = (idx: number) => scrollerRef.current?.children[idx] as HTMLElement | undefined
  const onScroll = () => {
    const scroller = scrollerRef.current
    const firstPage = getPage(0)
    const secondPage = getPage(1)
    if (!scroller || !firstPage || !secondPage) return
    const pageStride = secondPage.offsetLeft - firstPage.offsetLeft
    setActiveIdx(Math.round(scroller.scrollLeft / pageStride))
  }
  const goToPage = (idx: number) => {
    getPage(idx)?.scrollIntoView({behavior: 'smooth', inline: 'center', block: 'nearest'})
  }

  return (
    <div className='flex flex-col gap-2'>
      {prompts.length > 1 && (
        <div className='flex items-center justify-center gap-2 text-fg-muted text-xs'>
          <div className='flex items-center gap-1.5'>
            {prompts.map((prompt, idx) => (
              <button
                key={prompt.id}
                type='button'
                aria-label={`Question ${idx + 1}`}
                aria-current={idx === activeIdx}
                onClick={() => goToPage(idx)}
                className={cn(
                  'h-1.5 cursor-pointer rounded-full p-0 transition-all',
                  idx === activeIdx ? 'w-5 bg-surface-selected' : 'w-1.5 bg-hairline-strong'
                )}
              />
            ))}
          </div>
          <span aria-live='polite'>
            Question {activeIdx + 1} of {prompts.length} · swipe to change
          </span>
        </div>
      )}
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className={cn(
          '-mx-3 flex snap-x snap-mandatory items-start gap-2 overflow-x-auto pb-1 [scrollbar-width:none]',
          prompts.length > 1 ? 'px-7' : 'px-3'
        )}
      >
        {prompts.map((prompt, idx) => {
          const answeringStages = sharedStages.filter((stage) =>
            getSharedResponses(stage.responses).some((response) => response.promptId === prompt.id)
          )
          return (
            <section
              key={prompt.id}
              aria-label={prompt.question}
              aria-hidden={idx !== activeIdx}
              className={cn(
                'flex w-full shrink-0 snap-center flex-col gap-2 transition-opacity',
                idx !== activeIdx && 'opacity-60'
              )}
            >
              <div className='flex flex-col gap-0.5 rounded-card bg-surface-card px-3 py-2.5 shadow-[var(--shadow-card)]'>
                <div className='flex items-start gap-2 font-semibold text-sm'>
                  <span
                    className='mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full'
                    style={{background: prompt.groupColor}}
                  />
                  {prompt.question}
                </div>
                <div className='pl-[18px] text-fg-muted text-xs'>
                  {answeringStages.length} {answeringStages.length === 1 ? 'answer' : 'answers'}
                </div>
              </div>
              {answeringStages.length === 0 && (
                <div className='px-1 text-fg-secondary text-sm'>No one has answered this yet.</div>
              )}
              {answeringStages.map((stage) => (
                <TeamUpdatesQuestionRow
                  key={stage.id}
                  stageRef={stage}
                  prompt={prompt}
                  isWaiting={false}
                  isEnded={isEnded}
                  isSelected={false}
                  onReply={onReply}
                />
              ))}
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default TeamPromptMobileByQuestion
