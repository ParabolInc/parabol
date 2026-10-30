import type {JSONContent} from '@tiptap/core'
import type {Random} from './createRandom'
import {INSIGHTS_PROMPT, type RetroTopic, type Team} from './heavyCorpusData'
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
  hardBreak,
  heading,
  insightsBlock,
  paragraph,
  tableView,
  taskBlock
} from './tiptapNodes'

export interface RetroGroup {
  topic: RetroTopic
  votes: number
  comments: number
  reflections: string[]
}

const buildRetroPage = (
  random: Random,
  team: Team,
  date: Date,
  retroNumber: number,
  participants: string[],
  groups: RetroGroup[]
): JSONContent => {
  const day = formatMeetingDate(date)
  const tasks = groups
    .flatMap(({topic}) => (topic.task ? [topic.task] : []))
    .slice(0, 3)
    .map((text, index) => ({text, owner: participants[index % participants.length]!}))
  const reflectionCount = groups.reduce((sum, {reflections}) => sum + reflections.length, 0)
  const taskSection = tasks.flatMap(({text, owner}, index) => [
    ...(index > 0 ? [paragraph()] : []),
    taskBlock({id: randomUuid(random), preferredName: owner, avatar: avatarFor(owner), text})
  ])
  return {
    type: 'doc',
    content: [
      heading(1, `${team.short} Retro #${retroNumber} - ${day}`),
      paragraph(team.name, ` — ${day}`),
      paragraph(
        [
          plural(groups.length, 'Topic'),
          plural(tasks.length, 'New Task'),
          plural(reflectionCount, 'Reflection'),
          plural(participants.length, 'Participant')
        ].join(' - ')
      ),
      paragraph(),
      insightsBlock(
        {
          id: randomUuid(random),
          teamIds: [team.teamId],
          meetingTypes: ['retrospective'],
          after: atUtcTime(date, 14, 0).toISOString(),
          before: atUtcTime(date, 15, 0).toISOString(),
          meetingIds: [randomId(random)],
          hash: randomId(random, 8).toLowerCase(),
          prompt: INSIGHTS_PROMPT
        },
        [
          bulletList(
            groups
              .slice(0, 3)
              .map(({topic, reflections}) => paragraph(`${topic.title}: ${reflections[0]}`))
          )
        ]
      ),
      ...(tasks.length > 0 ? [heading(2, plural(tasks.length, 'Task')), ...taskSection] : []),
      heading(2, `${groups.length} Voted Topics`),
      bulletList(
        groups.map(({topic, votes, comments, reflections}) =>
          paragraph(
            topic.title,
            hardBreak,
            [
              plural(votes, 'Vote'),
              plural(topic.task ? 1 : 0, 'Task'),
              plural(comments, 'Comment'),
              plural(reflections.length, 'Reflection')
            ].join(', ')
          )
        )
      ),
      heading(2, plural(participants.length, 'Participant')),
      bulletList(participants.map((name) => paragraph(name))),
      paragraph(),
      tableView(
        ['Reflection Group', 'Votes', 'Type', 'Author', 'Prompt', 'Content', 'Discussion Thread'],
        groups.flatMap(({topic, votes, reflections}) =>
          reflections.map((text) => [
            topic.title,
            String(votes),
            'Reflection',
            'Anonymous',
            random.pick(team.retroPrompts),
            text,
            ''
          ])
        )
      )
    ]
  }
}

export default buildRetroPage
