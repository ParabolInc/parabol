import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamPromptSharedAnswers_stage$key} from '~/__generated__/TeamPromptSharedAnswers_stage.graphql'
import {TeamPromptResponseEmojis} from '../TeamPromptResponseEmojis'
import TeamPromptAnswerBlock from './TeamPromptAnswerBlock'
import {getSharedResponses} from './teamPromptStages'

interface Props {
  stageRef: TeamPromptSharedAnswers_stage$key
  prompts: readonly {id: string; question: string; groupColor: string}[]
}

const TeamPromptSharedAnswers = (props: Props) => {
  const {stageRef, prompts} = props
  const stage = useFragment(
    graphql`
      fragment TeamPromptSharedAnswers_stage on TeamPromptResponseStage {
        meetingId
        teamId
        responses {
          id
          promptId
          content
          sharedAt
          updatedAt
          ...TeamPromptResponseEmojis_response
        }
      }
    `,
    stageRef
  )
  const {meetingId, teamId, responses} = stage
  const responsesByPrompt = new Map(
    getSharedResponses(responses).map((response) => [response.promptId, response])
  )
  return (
    <>
      {prompts.map((prompt) => {
        const response = responsesByPrompt.get(prompt.id)
        if (!response) return null
        return (
          <div key={response.id}>
            <TeamPromptAnswerBlock teamId={teamId} prompt={prompt} content={response.content} />
            <TeamPromptResponseEmojis responseRef={response} meetingId={meetingId} />
          </div>
        )
      })}
    </>
  )
}

export default TeamPromptSharedAnswers
