import {useMemo, useState} from 'react'
import type {TeamUpdateStage} from './TeamUpdatesByPerson'
import TeamUpdatesQuestionRow from './TeamUpdatesQuestionRow'
import TeamUpdatesQuestionTabs from './TeamUpdatesQuestionTabs'

interface Props {
  prompts: readonly {id: string; question: string; groupColor: string}[]
  sharedStages: readonly TeamUpdateStage[]
  draftingStages: readonly TeamUpdateStage[]
  teamId: string
  meetingId: string
  selectedStageId: string | null
  onReply: (stageId: string) => void
}

const TeamUpdatesByQuestion = (props: Props) => {
  const {prompts, sharedStages, draftingStages, teamId, meetingId, selectedStageId, onReply} = props
  const [activeId, setActiveId] = useState(prompts[0]?.id ?? '')
  const counts = useMemo(() => {
    const answerCounts: Record<string, number> = {}
    for (const prompt of prompts) {
      answerCounts[prompt.id] = sharedStages.filter((stage) =>
        stage.response?.answers.some((answer) => answer.promptId === prompt.id)
      ).length
    }
    return answerCounts
  }, [prompts, sharedStages])
  const activePrompt = prompts.find((prompt) => prompt.id === activeId) ?? prompts[0]
  if (!activePrompt) return null
  const answeringStages = sharedStages.filter((stage) =>
    stage.response?.answers.some((answer) => answer.promptId === activePrompt.id)
  )
  return (
    <div className='mx-auto flex w-full max-w-[760px] flex-col gap-3 px-[5%] py-4'>
      <TeamUpdatesQuestionTabs
        prompts={prompts}
        counts={counts}
        activePromptId={activePrompt.id}
        onChange={setActiveId}
      />
      <div
        role='tabpanel'
        aria-labelledby={`team-question-tab-${activePrompt.id}`}
        className='flex flex-col gap-3'
      >
        {answeringStages.length === 0 && (
          <div className='text-fg-muted text-sm'>No one has answered this yet.</div>
        )}
        {answeringStages.map((stage) => (
          <TeamUpdatesQuestionRow
            key={stage.id}
            stageRef={stage}
            prompt={activePrompt}
            teamId={teamId}
            meetingId={meetingId}
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
            teamId={teamId}
            meetingId={meetingId}
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
