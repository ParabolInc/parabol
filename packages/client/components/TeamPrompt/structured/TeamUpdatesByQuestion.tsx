import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import type {TeamUpdatesByQuestion_stage$data} from '~/__generated__/TeamUpdatesByQuestion_stage.graphql'
import {cn} from '../../../ui/cn'
import TeamUpdatesQuestionRow from './TeamUpdatesQuestionRow'
import TeamUpdatesQuestionTabs from './TeamUpdatesQuestionTabs'
import {getSharedResponses} from './teamPromptStages'
import {TEAM_UPDATES_QUESTION_BAND} from './teamUpdatesLayout'

graphql`
  fragment TeamUpdatesByQuestion_stage on TeamPromptResponseStage {
    id
    responses {
      promptId
      sharedAt
      updatedAt
    }
    ...TeamUpdatesQuestionRow_stage
  }
`

export type TeamUpdatesQuestionStage = Omit<TeamUpdatesByQuestion_stage$data, ' $fragmentType'>

interface Props {
  prompts: readonly {id: string; question: string; groupColor: string}[]
  sharedStages: readonly TeamUpdatesQuestionStage[]
  waitingStages: readonly TeamUpdatesQuestionStage[]
  isEnded: boolean
  selectedStageId: string | null
  onReply: (stageId: string) => void
}

const TeamUpdatesByQuestion = (props: Props) => {
  const {prompts, sharedStages, waitingStages, isEnded, selectedStageId, onReply} = props
  const [activeId, setActiveId] = useState(prompts[0]?.id ?? '')
  const activePrompt = prompts.find((prompt) => prompt.id === activeId) ?? prompts[0]
  if (!activePrompt) return null
  const counts: Record<string, number> = {}
  let answeringStages: readonly TeamUpdatesQuestionStage[] = []
  for (const prompt of prompts) {
    const matchingStages = sharedStages.filter((stage) =>
      getSharedResponses(stage.responses).some((response) => response.promptId === prompt.id)
    )
    counts[prompt.id] = matchingStages.length
    if (prompt.id === activePrompt.id) answeringStages = matchingStages
  }
  return (
    <div className={cn(TEAM_UPDATES_QUESTION_BAND, 'flex flex-col gap-3 py-4')}>
      <TeamUpdatesQuestionTabs
        prompts={prompts}
        counts={counts}
        activePromptId={activePrompt.id}
        onChange={setActiveId}
      />
      <div
        role='tabpanel'
        id='team-question-panel'
        aria-labelledby={`team-question-tab-${activePrompt.id}`}
        tabIndex={0}
        className='flex flex-col gap-3'
      >
        {answeringStages.length === 0 && (
          <div className='text-fg-primary text-sm'>No one has answered this yet.</div>
        )}
        {answeringStages.map((stage) => (
          <TeamUpdatesQuestionRow
            key={stage.id}
            stageRef={stage}
            prompt={activePrompt}
            isWaiting={false}
            isEnded={isEnded}
            isSelected={selectedStageId === stage.id}
            onReply={onReply}
          />
        ))}
        {waitingStages.map((stage) => (
          <TeamUpdatesQuestionRow
            key={stage.id}
            stageRef={stage}
            prompt={activePrompt}
            isWaiting
            isEnded={isEnded}
            isSelected={false}
            onReply={onReply}
          />
        ))}
      </div>
    </div>
  )
}

export default TeamUpdatesByQuestion
