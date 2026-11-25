import {z} from 'zod'
import type {MeetingTypeEnum, Mutation} from '../../graphql/public/resolverTypes'
import defineTool from '../defineTool'
import runGraphQL from '../runGraphQL'
import {writeAnnotations} from '../toolAnnotations'
import toolError from '../toolError'
import toolResult from '../toolResult'

const MEETING_TYPE = `
  query MeetingType($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        meetingType
      }
    }
  }
`

const END_MUTATIONS = {
  retrospective: 'endRetrospective',
  action: 'endCheckIn',
  teamPrompt: 'endTeamPrompt',
  poker: 'endSprintPoker',
  teamHealth: 'endTeamHealth'
} as const satisfies Record<MeetingTypeEnum, keyof Mutation>

const endMeetingDocument = (meetingType: MeetingTypeEnum) => `
  mutation EndMeeting($meetingId: ID!) {
    endMeeting: ${END_MUTATIONS[meetingType]}(meetingId: $meetingId) {
      meeting {
        id
        name
        meetingType
        endedAt
        summaryPageId
      }
    }
  }
`

export default defineTool({
  name: 'end_meeting',
  title: 'End a meeting',
  description:
    "End a retrospective, check-in, standup, sprint poker meeting or team health check, in whatever phase it has reached. This can't be undone, and ending a team health check shows its results to the team. summaryPageId, when set, is the summary page to open with read_page. It refuses a meeting that has already ended or one on a team you aren't on. Timestamps are UTC. Needs users:read, meetings:read and meetings:write.",
  inputSchema: z.object({
    meetingId: z.string().describe('The meeting id, from list_meetings or the tool that started it')
  }),
  annotations: writeAnnotations,
  run: async (context, {meetingId}) => {
    const found = await runGraphQL<{viewer: {meeting: {meetingType: MeetingTypeEnum} | null}}>(
      context,
      MEETING_TYPE,
      {meetingId}
    )
    if (found.errors?.length) return toolResult({errors: found.errors})
    const meeting = found.data?.viewer.meeting
    if (!meeting) return toolError('Meeting not found', 'NOT_FOUND')
    return toolResult(
      await runGraphQL(context, endMeetingDocument(meeting.meetingType), {meetingId})
    )
  }
})
