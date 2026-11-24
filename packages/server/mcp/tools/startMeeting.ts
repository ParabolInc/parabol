import {z} from 'zod'
import type {MeetingTypeEnum} from '../../graphql/public/resolverTypes'
import defineTool from '../defineTool'
import runGraphQL from '../runGraphQL'
import {writeAnnotations} from '../toolAnnotations'
import toolError from '../toolError'
import toolResult from '../toolResult'

const STARTED_MEETING = `
  fragment StartedMeeting on NewMeeting {
    id
    name
    meetingType
    teamId
  }
`

const START_MEETING_FIELDS = {
  retrospective: 'startRetrospective(teamId: $teamId) { meeting { ...StartedMeeting } }',
  checkin: 'startCheckIn(teamId: $teamId) { meeting { ...StartedMeeting } }',
  poker: 'startSprintPoker(teamId: $teamId) { meeting { ...StartedMeeting } }',
  standup: 'startTeamPrompt(teamId: $teamId) { meeting { ...StartedMeeting } }',
  teamHealth:
    'startTeamHealth(teamIds: [$teamId], templateId: $templateId) { meetings { ...StartedMeeting } }'
} as const

type MeetingKind = keyof typeof START_MEETING_FIELDS

const MEETING_TYPE_BY_KIND = {
  retrospective: 'retrospective',
  checkin: 'action',
  poker: 'poker',
  standup: 'teamPrompt',
  teamHealth: 'teamHealth'
} as const satisfies Record<MeetingKind, MeetingTypeEnum>

const MEETING_KINDS = ['retrospective', 'checkin', 'poker', 'standup', 'teamHealth'] as const

const GET_TEMPLATE_TYPE = `
  query GetTemplateType($templateId: ID!) {
    viewer {
      activity(activityId: $templateId) {
        type
      }
    }
  }
`

const SELECT_TEMPLATE = `
  selectTemplate(selectedTemplateId: $templateId, teamId: $teamId) {
    meetingSettings {
      meetingType
    }
  }
`

const getStartMeetingDocument = (kind: MeetingKind, hasTemplate: boolean) => `
  mutation StartMeeting($teamId: ID!${hasTemplate ? ', $templateId: ID!' : ''}) {
    ${hasTemplate && kind !== 'teamHealth' ? SELECT_TEMPLATE : ''}
    ${START_MEETING_FIELDS[kind]}
  }
  ${STARTED_MEETING}
`

export default defineTool({
  name: 'start_meeting',
  title: 'Start a meeting',
  description:
    'Start a meeting on a team: a retrospective, check-in, sprint poker, standup or team health check. A templateId must be a template of that kind and needs users:read and templates:read. A team health check needs a templateId. A retrospective, sprint poker or standup uses the team’s selected template, or templateId, which becomes the selected one and also needs teams:write. Check-ins have no template. Needs meetings:write.',
  inputSchema: {
    teamId: z.string().describe('The team to meet, from get_me'),
    kind: z.enum(MEETING_KINDS).describe('The kind of meeting'),
    templateId: z.string().optional().describe('The template to run the meeting with')
  },
  annotations: writeAnnotations,
  run: async (context, {teamId, kind, templateId}) => {
    if (kind === 'teamHealth' && !templateId) {
      return toolError('A team health check needs a templateId.', 'BAD_USER_INPUT')
    }
    if (kind === 'checkin' && templateId) {
      return toolError('Check-ins have no template. Leave templateId out.', 'BAD_USER_INPUT')
    }
    if (templateId) {
      const template = await runGraphQL<{viewer: {activity: {type: MeetingTypeEnum} | null}}>(
        context,
        GET_TEMPLATE_TYPE,
        {templateId}
      )
      if (template.errors?.length || !template.data) return toolResult(template)
      const {activity} = template.data.viewer
      if (!activity) {
        return toolError('No template with that templateId is open to you.', 'NOT_FOUND')
      }
      if (activity.type !== MEETING_TYPE_BY_KIND[kind]) {
        return toolError(
          `That template is for ${activity.type} meetings, so it cannot start a ${kind}.`,
          'BAD_USER_INPUT'
        )
      }
    }
    return toolResult(
      await runGraphQL(context, getStartMeetingDocument(kind, !!templateId), {teamId, templateId})
    )
  }
})
