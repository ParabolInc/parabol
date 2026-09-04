import {useState} from 'react'
import {cn} from '../../../ui/cn'
import type {TeamUpdateStage} from './TeamUpdatesByPerson'
import TeamUpdatesQuestionRow from './TeamUpdatesQuestionRow'
import TeamUpdatesQuestionTabs from './TeamUpdatesQuestionTabs'
import {TEAM_UPDATES_QUESTION_BAND} from './teamUpdatesLayout'

interface Props {
  prompts: readonly {id: string; question: string; groupColor: string}[]
  sharedStages: readonly TeamUpdateStage[]
  draftingStages: readonly TeamUpdateStage[]
  selectedStageId: string | null
  onReply: (stageId: string) => void
}

const TeamUpdatesByQuestion = (props: Props) => {
  const {prompts, sharedStages, draftingStages, selectedStageId, onReply} = props
  const [activeId, setActiveId] = useState(prompts[0]?.id ?? '')
  const activePrompt = prompts.find((prompt) => prompt.id === activeId) ?? prompts[0]
  if (!activePrompt) return null
  const counts: Record<string, number> = {}
  let answeringStages: readonly TeamUpdateStage[] = []
  for (const prompt of prompts) {
    const matchingStages = sharedStages.filter((stage) =>
      stage.response?.answers.some((answer) => answer.promptId === prompt.id)
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
            isDrafting={false}
            isSelected={selectedStageId === stage.id}
            promptCount={prompts.length}
            onReply={onReply}
          />
        ))}
        {draftingStages.map((stage) => (
          <TeamUpdatesQuestionRow
            key={stage.id}
            stageRef={stage}
            prompt={activePrompt}
            isDrafting
            isSelected={false}
            promptCount={prompts.length}
            onReply={onReply}
          />
        ))}
      </div>
    </div>
  )
}

export default TeamUpdatesByQuestion
