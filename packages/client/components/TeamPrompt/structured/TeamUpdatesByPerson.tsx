import graphql from 'babel-plugin-relay/macro'
import type {TeamUpdatesByPerson_stage$data} from '~/__generated__/TeamUpdatesByPerson_stage.graphql'
import {cn} from '../../../ui/cn'
import TeamPromptDraftingCard from './TeamPromptDraftingCard'
import TeamPromptSharedResponseCard from './TeamPromptSharedResponseCard'
import {TEAM_UPDATES_BAND, TEAM_UPDATES_GRID_COLUMNS} from './teamUpdatesLayout'

graphql`
  fragment TeamUpdatesByPerson_stage on TeamPromptResponseStage {
    id
    teamMember {
      user {
        preferredName
        picture
      }
    }
    response {
      answeredPromptIds
    }
    ...TeamPromptSharedResponseCard_stage
  }
`

export type TeamUpdateStage = Omit<TeamUpdatesByPerson_stage$data, ' $fragmentType'>

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
        TEAM_UPDATES_BAND,
        'grid gap-[28px_32px] py-4',
        layout === 'grid' ? TEAM_UPDATES_GRID_COLUMNS : 'grid-cols-1'
      )}
    >
      {sharedStages.map((stage) => (
        <TeamPromptSharedResponseCard
          key={stage.id}
          stageRef={stage}
          prompts={prompts}
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
