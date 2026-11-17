import type {JSONContent} from '@tiptap/core'
import type {Random} from './createRandom'
import {INSIGHTS_PROMPT, STANDUP_PROMPTS, type Team} from './heavyCorpusData'
import {
  atUtcTime,
  avatarFor,
  formatMeetingDate,
  plural,
  randomId,
  randomUuid
} from './heavyCorpusFormat'
import {
  bulletList,
  heading,
  insightsBlock,
  paragraph,
  responseBlock,
  tableView
} from './tiptapNodes'

export interface StandupResponse {
  member: string
  working: string
  stuck: string
  blocked: boolean
  projectName: string
  createdAt: Date
}

const toInsight = ({member, blocked, stuck, projectName}: StandupResponse) =>
  paragraph(
    blocked
      ? `${member} needs help: ${stuck}`
      : `${member} is making progress on the ${projectName}.`
  )

const buildStandupPage = (
  random: Random,
  team: Team,
  date: Date,
  responses: StandupResponse[]
): JSONContent => {
  const day = formatMeetingDate(date)
  const meetingId = randomId(random)
  const responseCount = plural(responses.length, 'Response')
  return {
    type: 'doc',
    content: [
      heading(1, `${team.short} Standup - ${day}`),
      paragraph(team.name, ` — ${day}`),
      paragraph(responseCount),
      paragraph(),
      insightsBlock(
        {
          id: randomUuid(random),
          teamIds: [team.teamId],
          meetingTypes: ['teamPrompt'],
          after: atUtcTime(date, 13, 0).toISOString(),
          before: atUtcTime(date, 24, 0).toISOString(),
          meetingIds: [meetingId],
          hash: randomId(random, 8).toLowerCase(),
          prompt: INSIGHTS_PROMPT
        },
        responses.length < 2
          ? [paragraph('Not enough data to generate insights')]
          : [bulletList(responses.slice(0, 3).map(toInsight))]
      ),
      heading(2, responseCount),
      ...responses.map(({member, working, stuck}) =>
        responseBlock({
          id: randomUuid(random),
          preferredName: member,
          avatar: avatarFor(member),
          content: {
            type: 'doc',
            content: [
              heading(3, STANDUP_PROMPTS.working),
              paragraph(working),
              heading(3, STANDUP_PROMPTS.stuck),
              paragraph(stuck)
            ]
          }
        })
      ),
      paragraph(),
      tableView(
        ['Author', 'Created at', 'Content'],
        responses.map(({member, working, stuck, createdAt}) => [
          member,
          createdAt.toISOString(),
          [STANDUP_PROMPTS.working, working, STANDUP_PROMPTS.stuck, stuck].join('\n\n')
        ])
      )
    ]
  }
}

export default buildStandupPage
