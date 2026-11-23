import {assertEnumType} from 'graphql'
import {z} from 'zod'
import rootSchema from '../../graphql/public/rootSchema'
import defineTool from '../defineTool'
import runGraphQL from '../runGraphQL'
import {readAnnotations} from '../toolAnnotations'
import toolResult from '../toolResult'

const MEETING_TYPES = assertEnumType(rootSchema.getType('MeetingTypeEnum'))
  .getValues()
  .map(({name}) => name)

const MEETING_CONNECTION = `
  edges {
    node {
      id
      name
      meetingType
      teamId
      createdAt
      endedAt
    }
  }
  pageInfo {
    hasNextPage
  }
`

const LIST_TEAM_IDS = `
  query ListTeamIds {
    viewer {
      teams {
        id
      }
    }
  }
`

const LIST_MEETINGS = `
  query ListMeetings(
    $first: Int!
    $teamIds: [ID!]!
    $meetingTypes: [MeetingTypeEnum!]!
    $before: DateTime!
  ) {
    viewer {
      meetings(first: $first, teamIds: $teamIds, meetingTypes: $meetingTypes, before: $before) {
        ${MEETING_CONNECTION}
      }
    }
  }
`

const LIST_TEAM_MEETINGS = `
  query ListTeamMeetings(
    $first: Int!
    $teamId: ID!
    $meetingTypes: [MeetingTypeEnum!]!
    $before: DateTime!
  ) {
    viewer {
      team(teamId: $teamId) {
        id
      }
      meetings(first: $first, teamIds: [$teamId], meetingTypes: $meetingTypes, before: $before) {
        ${MEETING_CONNECTION}
      }
    }
  }
`

export default defineTool({
  name: 'list_meetings',
  title: 'List meetings',
  description:
    'List meetings of every kind on your teams, or on one team. The order is not by date. Use get_meeting for what happened in one. Needs users:read, teams:read and meetings:read.',
  inputSchema: {
    teamId: z.string().optional().describe('Only list meetings of this team'),
    first: z.number().int().min(1).max(100).default(20).describe('Most meetings to return')
  },
  annotations: readAnnotations,
  run: async (context, {teamId, first}) => {
    const variables = {first, meetingTypes: MEETING_TYPES, before: new Date().toISOString()}
    if (teamId) {
      return toolResult(await runGraphQL(context, LIST_TEAM_MEETINGS, {...variables, teamId}))
    }
    const teams = await runGraphQL<{viewer: {teams: {id: string}[]}}>(context, LIST_TEAM_IDS)
    if (teams.errors?.length || !teams.data) return toolResult(teams)
    const teamIds = teams.data.viewer.teams.map(({id}) => id)
    return toolResult(await runGraphQL(context, LIST_MEETINGS, {...variables, teamIds}))
  }
})
