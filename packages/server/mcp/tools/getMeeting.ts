import {z} from 'zod'
import defineTool from '../defineTool'
import runGraphQL from '../runGraphQL'
import {readAnnotations} from '../toolAnnotations'
import toolResult from '../toolResult'

const TASK_FIELDS = `
  id
  plaintextContent
  status
  userId
`

const GET_MEETING = `
  query GetMeeting($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        id
        name
        meetingType
        teamId
        createdAt
        endedAt
        summary
        summaryPageId
        ... on RetrospectiveMeeting {
          reflectionGroups {
            title
            voteCount
            prompt {
              question
            }
            reflections {
              plaintextContent
            }
          }
          tasks {
            ${TASK_FIELDS}
          }
        }
        ... on ActionMeeting {
          tasks {
            ${TASK_FIELDS}
          }
        }
        ... on TeamPromptMeeting {
          responses {
            userId
            plaintextContent
          }
          tasks {
            ${TASK_FIELDS}
          }
        }
      }
    }
  }
`

export default defineTool({
  name: 'get_meeting',
  title: 'Get a meeting',
  description:
    'Show one meeting: its summary, its reflections (retrospectives) or responses (standups), and the tasks it made. summaryPageId, when set, is a page to open with read_page. Needs users:read and meetings:read.',
  inputSchema: {
    meetingId: z.string().describe('The meeting id, from list_meetings or start_meeting')
  },
  annotations: readAnnotations,
  run: async (context, {meetingId}) =>
    toolResult(await runGraphQL(context, GET_MEETING, {meetingId}))
})
