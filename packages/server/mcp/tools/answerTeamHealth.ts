import type {FormattedExecutionResult} from 'graphql'
import {z} from 'zod'
import defineTool from '../defineTool'
import ensureMeetingMember from '../ensureMeetingMember'
import runGraphQL from '../runGraphQL'
import {writeAnnotations} from '../toolAnnotations'
import toolError from '../toolError'
import toolResult from '../toolResult'

const TEAM_HEALTH_QUESTION_STAGES = `
  query TeamHealthQuestionStages($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        meetingType
        phases {
          ... on TeamHealthResponsePhase {
            stages {
              id
              question {
                id
              }
            }
          }
        }
      }
    }
  }
`

const SET_TEAM_HEALTH_RESPONSE = `
  mutation SetTeamHealthResponse(
    $meetingId: ID!
    $stageId: ID!
    $score: Int
    $comment: String
    $isAnonymous: Boolean!
  ) {
    setTeamHealthResponse(
      meetingId: $meetingId
      stageId: $stageId
      score: $score
      comment: $comment
      isAnonymous: $isAnonymous
    ) {
      meeting {
        id
        respondentCount
        isViewerComplete
      }
    }
  }
`

type QuestionStages = {
  viewer: {
    meeting: {
      meetingType: string
      phases: {stages?: {id: string; question: {id: string}}[]}[]
    } | null
  }
}

export default defineTool({
  name: 'answer_team_health',
  title: 'Answer a team health check',
  description:
    "Answer a team health check's questions as yourself, joining the check first if you haven't, and opting in if you were sitting it out, as team leads do by default. Each answer replaces your earlier answer to that question, comment included. Nobody sees a score with your name on it, and the team sees none of your answers until the check ends. A comment is plain text and anonymous by default: AI rewords it before the team reads it, so nobody can tell who wrote it, and if AI is off for your organization or this Parabol instance, or fails, the team never sees it. Set isAnonymous to false to share a comment word for word with your name. It refuses a question the check doesn't ask, a meeting that isn't a team health check, one that has ended and one on a team you aren't on. When it refuses an answer, the answers before it stay saved: fix it and call again. Needs users:read, meetings:read and meetings:write.",
  inputSchema: z.object({
    meetingId: z
      .string()
      .describe("The team health check's meeting id, from start_team_health or list_meetings"),
    answers: z
      .array(
        z.object({
          questionId: z
            .string()
            .describe('The question to answer, from start_team_health or get_team_health_meeting'),
          score: z
            .number()
            .int()
            .min(1)
            .max(5)
            .nullable()
            .describe(
              'Your score, from 1 (strongly disagree) to 5 (strongly agree), or null to skip the question'
            ),
          comment: z.string().trim().max(2000).optional().describe('A comment, in plain text'),
          isAnonymous: z
            .boolean()
            .default(true)
            .describe(
              'true, the default, to have AI reword the comment so the team cannot tell who wrote it; false to share it word for word with your name'
            )
        })
      )
      .min(1)
      .refine(
        (answers) => new Set(answers.map(({questionId}) => questionId)).size === answers.length,
        'Answer each question once'
      )
      .describe('Your answers, one per question')
  }),
  annotations: writeAnnotations,
  run: async (context, {meetingId, answers}) => {
    const found = await runGraphQL<QuestionStages>(context, TEAM_HEALTH_QUESTION_STAGES, {
      meetingId
    })
    if (found.errors?.length) return toolResult({errors: found.errors})
    const meeting = found.data?.viewer.meeting
    if (!meeting) return toolError('Meeting not found', 'NOT_FOUND')
    if (meeting.meetingType !== 'teamHealth') {
      return toolError('That meeting is not a team health check', 'BAD_USER_INPUT')
    }
    const stageIdByQuestionId = new Map(
      meeting.phases.flatMap(({stages}) => stages ?? []).map(({id, question}) => [question.id, id])
    )
    const unasked = answers.find(({questionId}) => !stageIdByQuestionId.has(questionId))
    if (unasked) {
      return toolError(
        `The check doesn't ask question ${unasked.questionId}. start_team_health and get_team_health_meeting list the questions it asks`,
        'BAD_USER_INPUT'
      )
    }
    const notJoined = await ensureMeetingMember(context, meetingId)
    if (notJoined) return notJoined
    let saved: FormattedExecutionResult = {}
    for (const {questionId, score, comment, isAnonymous} of answers) {
      saved = await runGraphQL(context, SET_TEAM_HEALTH_RESPONSE, {
        meetingId,
        stageId: stageIdByQuestionId.get(questionId),
        score,
        comment: comment || null,
        isAnonymous
      })
      if (saved.errors?.length) return toolResult(saved, {questionId})
    }
    return toolResult(saved)
  }
})
