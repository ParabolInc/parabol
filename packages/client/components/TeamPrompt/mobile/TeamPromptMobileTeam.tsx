import TeamPromptSharedResponseCard from '../structured/TeamPromptSharedResponseCard'
import type {TeamUpdateStage} from '../structured/TeamUpdatesByPerson'
import TeamUpdatesLayoutSwitch from '../structured/TeamUpdatesLayoutSwitch'
import type {TeamLayout} from '../structured/useTeamLayoutPreference'
import TeamPromptMobileByQuestion from './TeamPromptMobileByQuestion'
import TeamPromptMobileWaitingRow from './TeamPromptMobileWaitingRow'

interface Props {
  layout: TeamLayout
  onLayoutChange: (layout: TeamLayout) => void
  prompts: readonly {id: string; question: string; groupColor: string}[]
  viewerStage: TeamUpdateStage | null
  sharedStages: readonly TeamUpdateStage[]
  waitingStages: readonly TeamUpdateStage[]
  isEnded: boolean
  onReply: (stageId: string) => void
}

const TeamPromptMobileTeam = (props: Props) => {
  const {layout, onLayoutChange, prompts, viewerStage, sharedStages, waitingStages} = props
  const {isEnded, onReply} = props
  const isByQuestion = layout === 'byQuestion' && prompts.length > 1
  const questionStages = viewerStage ? [...sharedStages, viewerStage] : sharedStages
  return (
    <div className='flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden p-3'>
      {prompts.length > 1 && (
        <div className='flex'>
          <TeamUpdatesLayoutSwitch layout={layout} onChange={onLayoutChange} isSingleColumn />
        </div>
      )}
      {isByQuestion ? (
        <TeamPromptMobileByQuestion
          prompts={prompts}
          sharedStages={questionStages}
          isEnded={isEnded}
          onReply={onReply}
        />
      ) : (
        <>
          {sharedStages.length === 0 && waitingStages.length === 0 && (
            <div className='px-1 text-fg-secondary text-sm'>
              {isEnded ? 'No teammates shared an update.' : 'No teammates have shared yet.'}
            </div>
          )}
          {sharedStages.map((stage) => (
            <TeamPromptSharedResponseCard
              key={stage.id}
              stageRef={stage}
              prompts={prompts}
              isSelected={false}
              onReply={onReply}
            />
          ))}
        </>
      )}
      <TeamPromptMobileWaitingRow
        members={waitingStages.map((stage) => stage.teamMember.user)}
        isEnded={isEnded}
      />
    </div>
  )
}

export default TeamPromptMobileTeam
