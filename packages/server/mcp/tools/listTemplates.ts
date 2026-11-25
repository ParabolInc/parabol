import isTemplateAvailableToTeam from 'parabol-client/shared/isTemplateAvailableToTeam'
import {z} from 'zod'
import type {MeetingTypeEnum, SharingScopeEnum} from '../../graphql/public/resolverTypes'
import defineTool from '../defineTool'
import runGraphQL from '../runGraphQL'
import {readAnnotations} from '../toolAnnotations'
import toolError from '../toolError'
import toolResult from '../toolResult'

const MAX_LISTED_TEMPLATES = 2000

const PROMPTS = `
  ... on PromptTemplate {
    prompts {
      question
    }
  }
`

const TEMPLATE_DETAILS = {
  retrospective: PROMPTS,
  teamPrompt: PROMPTS,
  poker: `
    ... on PokerTemplate {
      dimensions {
        name
        selectedScale {
          name
        }
      }
    }
  `,
  teamHealth: `
    ... on TeamHealthTemplate {
      questions {
        question
      }
    }
  `
} satisfies Partial<Record<MeetingTypeEnum, string>>

type TemplateMeetingType = keyof typeof TEMPLATE_DETAILS

const SCALES = `
  scales {
    id
    name
    values {
      label
    }
  }
`

const listTemplatesDocument = (meetingType: TemplateMeetingType) => `
  query ListTemplates($teamId: ID!, $meetingType: MeetingTypeEnum!, $first: Int!) {
    viewer {
      team(teamId: $teamId) {
        orgId
        isViewerOnTeam
        ${meetingType === 'poker' ? SCALES : ''}
      }
      availableTemplates(first: $first, type: $meetingType) {
        edges {
          node {
            id
            name
            scope
            orgId
            teamId
            isActive
            ${TEMPLATE_DETAILS[meetingType]}
          }
        }
      }
    }
  }
`

const SELECTED_TEMPLATE = `
  query ListTemplatesSelected($teamId: ID!, $meetingType: MeetingTypeEnum!) {
    viewer {
      team(teamId: $teamId) {
        meetingSettings(meetingType: $meetingType) {
          ... on RetrospectiveMeetingSettings {
            selectedTemplateId
          }
          ... on PokerMeetingSettings {
            selectedTemplateId
          }
          ... on TeamPromptMeetingSettings {
            selectedTemplateId
          }
        }
      }
    }
  }
`

interface SelectedTemplateData {
  viewer: {team: {meetingSettings: {selectedTemplateId?: string}} | null}
}

interface AvailableTemplate {
  id: string
  name: string
  scope: SharingScopeEnum
  orgId: string
  teamId: string
  isActive: boolean
  prompts?: {question: string}[]
  dimensions?: {name: string; selectedScale: {name: string}}[]
  questions?: {question: string}[]
}

interface ListTemplatesData {
  viewer: {
    team: {
      orgId: string
      isViewerOnTeam: boolean
      scales?: {id: string; name: string; values: {label: string}[]}[]
    } | null
    availableTemplates: {edges: {node: AvailableTemplate}[]}
  }
}

const describeTemplate = ({
  id,
  name,
  scope,
  prompts,
  dimensions,
  questions
}: AvailableTemplate) => ({
  id,
  name,
  scope,
  ...(prompts && {prompts: prompts.map(({question}) => question)}),
  ...(dimensions && {
    dimensions: dimensions.map(({name, selectedScale}) => ({name, scale: selectedScale.name}))
  }),
  ...(questions && {questions: questions.map(({question}) => question)})
})

export default defineTool({
  name: 'list_templates',
  title: 'List templates',
  description:
    "List the templates a team can run a kind of meeting with, as Parabol's template picker shows them. scope is TEAM for the team's own, ORGANIZATION for one shared across its organization, and PUBLIC for Parabol's built-in ones and others shared publicly. Retro and standup templates list their prompts, sprint poker templates their dimensions with each one's scale, and team health templates their questions. For sprint poker it also lists the scales the team can vote with. selectedTemplateId is the template the team's next meeting of this kind starts with, set by select_template; team health has none. Run a template with select_template, then start_retrospective, start_sprint_poker or start_standup; pass a team health template to start_team_health. It refuses a team you aren't on, unless you're a billing leader of its organization, who sees the organization's and Parabol's templates but not the team's own. Needs users:read, teams:read and templates:read.",
  inputSchema: z.object({
    teamId: z.string().describe('The team to list templates for, from get_me'),
    meetingType: z
      .enum(['retrospective', 'poker', 'teamPrompt', 'teamHealth'])
      .describe('The kind of meeting: poker is sprint poker and teamPrompt a standup')
  }),
  annotations: readAnnotations,
  run: async (context, {teamId, meetingType}) => {
    const result = await runGraphQL<ListTemplatesData>(
      context,
      listTemplatesDocument(meetingType),
      {
        teamId,
        meetingType,
        first: MAX_LISTED_TEMPLATES
      }
    )
    if (result.errors?.length) return toolResult({errors: result.errors})
    const viewer = result.data?.viewer
    const team = viewer?.team
    if (!viewer || !team) return toolError('Team not found', 'NOT_FOUND')
    const templates = viewer.availableTemplates.edges
      .map(({node}) => node)
      .filter((template) => isTemplateAvailableToTeam(template, {id: teamId, orgId: team.orgId}))
      .map(describeTemplate)
    const selected =
      team.isViewerOnTeam && meetingType !== 'teamHealth'
        ? await runGraphQL<SelectedTemplateData>(context, SELECTED_TEMPLATE, {teamId, meetingType})
        : null
    if (selected?.errors?.length) return toolResult({errors: selected.errors})
    const selectedTemplateId = selected?.data?.viewer.team?.meetingSettings.selectedTemplateId
    return toolResult({
      data: {
        ...(selectedTemplateId && {selectedTemplateId}),
        ...(team.scales && {
          scales: team.scales.map(({id, name, values}) => ({
            id,
            name,
            values: values.map(({label}) => label)
          }))
        }),
        templates
      }
    })
  }
})
