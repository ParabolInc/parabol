import type {TeamUpdatesSection_meeting$data} from '~/__generated__/TeamUpdatesSection_meeting.graphql'
import {cn} from '../../../ui/cn'
import TeamPromptDraftingCard from './TeamPromptDraftingCard'
import TeamPromptSharedResponseCard from './TeamPromptSharedResponseCard'

export type TeamUpdateStage = NonNullable<
  TeamUpdatesSection_meeting$data['phases'][number]['stages']
>[number]

interface Props {
  layout: 'grid' | 'feed'
  prompts: readonly {id: string; question: string; groupColor: string}[]
  sharedStages: readonly TeamUpdateStage[]
  draftingStages: readonly TeamUpdateStage[]
  notStartedStages: readonly TeamUpdateStage[]
  isEnded: boolean
  selectedStageId: string | null
  onReply: (stageId: string) => void
}

const TeamUpdatesByPerson = (props: Props) => {
  const {
    layout,
    prompts,
    sharedStages,
    draftingStages,
    notStartedStages,
    isEnded,
    selectedStageId,
    onReply
  } = props
  return (
    <div
      className={cn(
        'mx-auto grid max-w-[1240px] gap-[28px_32px] px-[5%] py-4',
        layout === 'grid' ? 'min-[880px]:grid-cols-2' : 'grid-cols-1'
      )}
    >
      {sharedStages.map((stage) => (
        <TeamPromptSharedResponseCard
          key={stage.id}
          stageRef={stage}
          prompts={prompts}
          variant={layout}
          isSelected={selectedStageId === stage.id}
          onReply={onReply}
        />
      ))}
      {draftingStages.map((stage) => (
        <TeamPromptDraftingCard
          key={stage.id}
          preferredName={stage.teamMember.user.preferredName}
          picture={stage.teamMember.user.picture}
          answeredCount={stage.response?.answeredPromptIds.length ?? 0}
          promptCount={prompts.length}
          hasStarted
          isEnded={isEnded}
        />
      ))}
      {notStartedStages.map((stage) => (
        <TeamPromptDraftingCard
          key={stage.id}
          preferredName={stage.teamMember.user.preferredName}
          picture={stage.teamMember.user.picture}
          answeredCount={0}
          promptCount={prompts.length}
          hasStarted={false}
          isEnded={isEnded}
        />
      ))}
    </div>
  )
}

export default TeamUpdatesByPerson
