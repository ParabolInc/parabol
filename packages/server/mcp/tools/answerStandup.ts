import {STANDUP_RESPONSE_CHARACTER_LIMIT} from 'parabol-client/shared/tiptap/standupResponseLength'
import {Threshold} from 'parabol-client/types/constEnums'
import {z} from 'zod'
import defineTool from '../defineTool'
import ensureMeetingMember from '../ensureMeetingMember'
import markdownToTaskContent from '../markdownToTaskContent'
import runGraphQL from '../runGraphQL'
import {withMarkdownContent} from '../tipTapContentToMarkdown'
import {writeAnnotations} from '../toolAnnotations'
import toolResult from '../toolResult'

const UPSERT_TEAM_PROMPT_RESPONSE = `
  mutation UpsertTeamPromptResponse($meetingId: ID!, $promptId: ID!, $content: String!) {
    upsertTeamPromptResponse(meetingId: $meetingId, promptId: $promptId, content: $content) {
      teamPromptResponse {
        id
      }
    }
  }
`

const SHARE_TEAM_PROMPT_RESPONSES = `
  mutation ShareTeamPromptResponses($meetingId: ID!) {
    shareTeamPromptResponses(meetingId: $meetingId) {
      responses {
        id
        promptId
        content
        plaintextContent
        sharedAt
      }
    }
  }
`

export default defineTool({
  name: 'answer_standup',
  title: 'Answer a standup',
  description: `Answer a standup's prompts as yourself and share your answers with the team, joining the meeting first if you haven't. Each answer replaces your earlier answer to that prompt. Answers are markdown; anything the standup editor can't show, such as a callout, becomes plain paragraphs. It refuses a prompt that isn't one of the meeting's, an answer over ${STANDUP_RESPONSE_CHARACTER_LIMIT.toLocaleString('en-US')} characters, a meeting that has ended and one on a team you aren't on. Sharing publishes every unshared answer you have in this standup, including drafts you started in Parabol, and the result lists them all. When it refuses an answer, the answers before it stay saved and nothing new is shared, though a new answer to a prompt you had already shared shows at once: fix it and call again. Timestamps are UTC. Needs meetings:write.`,
  inputSchema: z.object({
    meetingId: z.string().describe("The standup's meeting id, from start_standup or list_meetings"),
    answers: z
      .array(
        z.object({
          promptId: z.string().describe('The prompt to answer, from start_standup or get_standup'),
          content: z.string().min(1).describe('The answer, in markdown')
        })
      )
      .min(1)
      .max(Threshold.MAX_STANDUP_PROMPTS)
      .refine(
        (answers) => new Set(answers.map(({promptId}) => promptId)).size === answers.length,
        'Answer each prompt once'
      )
      .describe('Your answers, one per prompt')
  }),
  annotations: writeAnnotations,
  run: async (context, {meetingId, answers}) => {
    const notJoined = await ensureMeetingMember(context, meetingId)
    if (notJoined) return notJoined
    for (const {promptId, content} of answers) {
      const saved = await runGraphQL(context, UPSERT_TEAM_PROMPT_RESPONSE, {
        meetingId,
        promptId,
        content: markdownToTaskContent(content, 'standup')
      })
      if (saved.errors?.length) return toolResult(saved, {promptId})
    }
    return toolResult(
      withMarkdownContent(await runGraphQL(context, SHARE_TEAM_PROMPT_RESPONSES, {meetingId}))
    )
  }
})
