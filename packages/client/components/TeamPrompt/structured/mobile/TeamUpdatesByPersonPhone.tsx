import {type RefObject, useRef, useState} from 'react'
import TeamPromptDraftingCard from '../TeamPromptDraftingCard'
import TeamPromptSharedResponseCard from '../TeamPromptSharedResponseCard'
import type {TeamUpdateStage} from '../TeamUpdatesByPerson'
import memberCardScrollTop, {STICKY_HEADER_OFFSET} from './memberCardScrollTop'
import TeamUpdatesMemberChips from './TeamUpdatesMemberChips'

const toMember = (stage: TeamUpdateStage, isDrafting: boolean) => ({
  id: stage.id,
  preferredName: stage.teamMember.user.preferredName,
  picture: stage.teamMember.user.picture,
  isDrafting
})

interface Props {
  prompts: readonly {id: string; question: string; groupColor: string}[]
  sharedStages: readonly TeamUpdateStage[]
  draftingStages: readonly TeamUpdateStage[]
  notStartedStages: readonly TeamUpdateStage[]
  isEnded: boolean
  selectedStageId: string | null
  onReply: (stageId: string) => void
  scrollContainerRef: RefObject<HTMLDivElement | null>
}

const TeamUpdatesByPersonPhone = (props: Props) => {
  const {
    prompts,
    sharedStages,
    draftingStages,
    notStartedStages,
    isEnded,
    selectedStageId,
    onReply,
    scrollContainerRef
  } = props
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<Record<string, HTMLDivElement | null>>({})
  const members = [
    ...sharedStages.map((stage) => toMember(stage, false)),
    ...draftingStages.map((stage) => toMember(stage, true)),
    ...notStartedStages.map((stage) => toMember(stage, true))
  ]
  const onSelect = (stageId: string | null) => {
    setSelectedMemberId(stageId)
    const container = scrollContainerRef.current
    const target = stageId ? cardsRef.current[stageId] : rootRef.current
    if (!container || !target) return
    container.scrollTo({
      top: memberCardScrollTop({
        containerScrollTop: container.scrollTop,
        containerTop: container.getBoundingClientRect().top,
        cardTop: target.getBoundingClientRect().top,
        offset: stageId ? STICKY_HEADER_OFFSET : 0
      }),
      behavior: 'smooth'
    })
  }
  const setCardRef = (stageId: string) => (el: HTMLDivElement | null) => {
    cardsRef.current[stageId] = el
  }
  return (
    <div ref={rootRef}>
      <TeamUpdatesMemberChips members={members} selectedId={selectedMemberId} onSelect={onSelect} />
      <div className='flex flex-col gap-6 px-4 py-2'>
        {sharedStages.map((stage) => (
          <div key={stage.id} ref={setCardRef(stage.id)}>
            <TeamPromptSharedResponseCard
              stageRef={stage}
              prompts={prompts}
              isSelected={selectedStageId === stage.id}
              onReply={onReply}
              isPhone
            />
          </div>
        ))}
        {[...draftingStages, ...notStartedStages].map((stage) => (
          <div key={stage.id} ref={setCardRef(stage.id)}>
            <TeamPromptDraftingCard
              preferredName={stage.teamMember.user.preferredName}
              picture={stage.teamMember.user.picture}
              answeredCount={stage.response?.answeredPromptIds.length ?? 0}
              promptCount={prompts.length}
              hasStarted={!!stage.response}
              isEnded={isEnded}
              isPhone
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default TeamUpdatesByPersonPhone
