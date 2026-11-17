import type {JSONContent} from '@tiptap/core'
import type {EvalCorpus} from '../seedEvalPages'
import toFixture from '../toFixture'
import buildDocPage from './buildDocPage'
import buildMeetingSummariesPage from './buildMeetingSummariesPage'
import buildPokerPage from './buildPokerPage'
import buildRetroPage, {type RetroGroup} from './buildRetroPage'
import buildStandupPage, {type StandupResponse} from './buildStandupPage'
import createRandom, {type Random} from './createRandom'
import {
  BLOCKER_TEMPLATES,
  DOCS,
  EXTRA_WORK,
  NO_BLOCKERS,
  PLAN_NOTES,
  PLANTED_RETRO_TOPICS,
  PLANTED_STORY_POINTS,
  PLANTED_UPDATES,
  type PlantedUpdate,
  PROGRESS_NOTES,
  RETRO_TOPICS,
  SHORT_DOCS,
  STORY_POINTS,
  TEAMS,
  type Team,
  type TeamKey,
  WORKING_AFTER_DONE_TEMPLATES,
  WORKING_TEMPLATES
} from './heavyCorpusData'
import {atUtcTime, capitalize, fill, firstName, toIsoDay} from './heavyCorpusFormat'
import {heading, paragraph} from './tiptapNodes'

export interface GeneratedPage {
  key: string
  content: JSONContent
  updatedAt: Date
}

interface MemberState {
  member: string
  projectIndex: number
  phase: number
  daysOnPhase: number
}

const SEED = 20261029
const DAY_MS = 86_400_000
const FIRST_DAY = Date.UTC(2026, 5, 1)
const WEEKS = 19
const MEETINGS_PER_TEAM = 9
const FIRST_POKER_DAY = Date.UTC(2026, 5, 9)
const FIRST_RETRO_DAY = Date.UTC(2026, 5, 11)
const HEADER_ONLY_CHANCE = 0.33
const PARTICIPATION_RATES = [0.2, 0.3, 0.4, 0.55, 0.75]
const BLOCKED_CHANCE = 0.25
const PROGRESS_CHANCE = 0.7
const EXTRA_WORK_CHANCE = 0.55
const PLAN_CHANCE = 0.4
const TEAM_MINUTE: Record<TeamKey, number> = {atlas: 0, beacon: 5}

const getWorkdays = () =>
  Array.from({length: WEEKS * 7}, (_, index) => new Date(FIRST_DAY + index * DAY_MS)).filter(
    (date) => date.getUTCDay() !== 0 && date.getUTCDay() !== 6
  )

const everyOtherWeek = (firstDay: number) =>
  Array.from({length: MEETINGS_PER_TEAM}, (_, index) => new Date(firstDay + index * 14 * DAY_MS))

const titleOf = (content: JSONContent) => content.content?.[0]?.content?.[0]?.text ?? ''

const advance = (random: Random, team: Team, state: MemberState) => {
  state.daysOnPhase++
  if (state.daysOnPhase < random.int(2, 4)) return
  state.daysOnPhase = 0
  state.phase++
  if (state.phase < team.projects[state.projectIndex]!.doing.length) return
  state.phase = 0
  state.projectIndex =
    (state.projectIndex + random.int(1, team.projects.length - 1)) % team.projects.length
}

const writeResponse = (
  random: Random,
  team: Team,
  state: MemberState,
  createdAt: Date,
  planted: PlantedUpdate | undefined
): StandupResponse => {
  const project = team.projects[state.projectIndex]!
  const colleagues = team.members.filter((name) => name !== state.member)
  const doing = project.doing[state.phase % project.doing.length]!
  const nextDoing = project.doing[(state.phase + 1) % project.doing.length]!
  const templates =
    state.phase > 0 ? [...WORKING_TEMPLATES, ...WORKING_AFTER_DONE_TEMPLATES] : WORKING_TEMPLATES
  const sentences = [
    fill(random.pick(templates), {
      doing,
      Doing: capitalize(doing),
      done: project.doing[state.phase - 1] ?? '',
      story: random.pick(project.stories),
      project: project.name
    }),
    random.chance(PROGRESS_CHANCE) ? random.pick(PROGRESS_NOTES) : '',
    random.chance(EXTRA_WORK_CHANCE)
      ? fill(random.pick(EXTRA_WORK), {
          colleague: firstName(random.pick(colleagues)),
          project: project.name
        })
      : '',
    random.chance(PLAN_CHANCE) ? fill(random.pick(PLAN_NOTES), {nextDoing}) : ''
  ]
  const working = planted?.working ?? sentences.filter(Boolean).join(' ')
  const blocked = planted?.stuck !== undefined || random.chance(BLOCKED_CHANCE)
  const routineStuck = blocked
    ? fill(random.pick(BLOCKER_TEMPLATES), {
        blocker: random.pick(team.blockers),
        colleague: firstName(random.pick(colleagues)),
        project: project.name
      })
    : random.pick(NO_BLOCKERS)
  const stuck = planted?.stuck ?? routineStuck
  advance(random, team, state)
  return {member: state.member, working, stuck, blocked, projectName: project.name, createdAt}
}

const checkPlantedUpdates = (team: Team, workdays: Date[]) => {
  const days = new Set(workdays.map(toIsoDay))
  for (const {team: teamKey, date, member} of PLANTED_UPDATES) {
    if (teamKey !== team.key) continue
    if (!days.has(date) || !team.members.includes(member)) {
      throw new Error(
        `The planted update for ${member} on ${date} needs a workday and a member of ${team.name}`
      )
    }
  }
}

const generateStandups = (random: Random, team: Team, workdays: Date[]): GeneratedPage[] => {
  checkPlantedUpdates(team, workdays)
  const states: MemberState[] = team.members.map((member, index) => ({
    member,
    projectIndex: index % team.projects.length,
    phase: 0,
    daysOnPhase: 0
  }))
  return workdays.map((date) => {
    const day = toIsoDay(date)
    const planted = PLANTED_UPDATES.filter(
      (update) => update.team === team.key && update.date === day
    )
    const headerOnly = planted.length === 0 && random.chance(HEADER_ONLY_CHANCE)
    const participation = random.pick(PARTICIPATION_RATES)
    const answering = headerOnly
      ? []
      : states.filter(
          ({member}) =>
            planted.some((update) => update.member === member) || random.chance(participation)
        )
    if (!headerOnly && answering.length === 0) answering.push(random.pick(states))
    const responses = answering
      .map((state) => ({state, createdAt: atUtcTime(date, 13, random.int(0, 239))}))
      .sort((first, second) => first.createdAt.getTime() - second.createdAt.getTime())
      .map(({state, createdAt}) =>
        writeResponse(
          random,
          team,
          state,
          createdAt,
          planted.find((update) => update.member === state.member)
        )
      )
    return {
      key: `${team.key}-standup-${day}`,
      content: buildStandupPage(random, team, date, responses),
      updatedAt: atUtcTime(date, 17, TEAM_MINUTE[team.key])
    }
  })
}

const generateRetros = (random: Random, team: Team): GeneratedPage[] =>
  everyOtherWeek(FIRST_RETRO_DAY).map((date, index) => {
    const retroNumber = index + 1
    const participants = random.shuffle(team.members).slice(0, random.int(4, team.members.length))
    const planted = PLANTED_RETRO_TOPICS.filter(
      (entry) => entry.team === team.key && entry.retroNumber === retroNumber
    ).map(({topic}) => topic)
    const topics = [...planted, ...random.shuffle(RETRO_TOPICS).slice(0, random.int(2, 4))]
    const votes = topics.map(() => random.int(0, 8)).sort((first, second) => second - first)
    const groups: RetroGroup[] = topics.map((topic, topicIndex) => ({
      topic,
      votes: votes[topicIndex]!,
      comments: random.int(0, 2),
      reflections: random.shuffle(topic.reflections).slice(0, random.int(2, 3))
    }))
    return {
      key: `${team.key}-retro-${retroNumber}`,
      content: buildRetroPage(random, team, date, retroNumber, participants, groups),
      updatedAt: atUtcTime(date, 17, 30 + TEAM_MINUTE[team.key])
    }
  })

const generatePokers = (random: Random, team: Team): GeneratedPage[] => {
  const stories = team.projects.flatMap((project) => project.stories)
  let queue: string[] = []
  const nextStory = () => {
    if (queue.length === 0) queue = random.shuffle(stories)
    return queue.shift()!
  }
  return everyOtherWeek(FIRST_POKER_DAY).map((date, index) => {
    const pokerNumber = index + 1
    const participants = random.shuffle(team.members).slice(0, random.int(3, team.members.length))
    const storyCount = random.int(3, 6)
    const sessionStories = new Set<string>()
    while (sessionStories.size < storyCount) sessionStories.add(nextStory())
    const estimates = [...sessionStories].map((story): [string, string] => [
      story,
      PLANTED_STORY_POINTS[story] ?? random.pick(STORY_POINTS)
    ])
    return {
      key: `${team.key}-poker-${pokerNumber}`,
      content: buildPokerPage(team, date, pokerNumber, participants, estimates),
      updatedAt: atUtcTime(date, 16, 30 + TEAM_MINUTE[team.key])
    }
  })
}

const generateTeamPages = (
  random: Random,
  team: Team,
  workdays: Date[],
  firstPageCode: number
): GeneratedPage[] => {
  const summaries = [
    ...generateStandups(random, team, workdays),
    ...generateRetros(random, team),
    ...generatePokers(random, team)
  ]
  const newestFirst = [...summaries].sort(
    (first, second) => second.updatedAt.getTime() - first.updatedAt.getTime()
  )
  const meetingSummaries: GeneratedPage = {
    key: `${team.key}-meeting-summaries`,
    content: buildMeetingSummariesPage(
      team,
      newestFirst.map(({content}) => titleOf(content)),
      firstPageCode
    ),
    updatedAt: atUtcTime(workdays.at(-1)!, 18, TEAM_MINUTE[team.key])
  }
  return [...summaries, meetingSummaries]
}

const generateDocPages = (random: Random): GeneratedPage[] => [
  ...DOCS.map((doc, index) => {
    const team = TEAMS.find(({key}) => key === doc.team)!
    const otherDocs = DOCS.filter((other) => other.team === doc.team && other.key !== doc.key)
    return {
      key: doc.key,
      content: buildDocPage(random, doc, {
        members: team.members,
        relatedTitles: [1, 2, 3].map(
          (offset) => otherDocs[(index + offset) % otherDocs.length]!.title
        )
      }),
      updatedAt: new Date(doc.updatedAt)
    }
  }),
  ...SHORT_DOCS.map(({key, title, text, updatedAt}) => ({
    key,
    content: {type: 'doc', content: [heading(1, title), ...(text ? [paragraph(text)] : [])]},
    updatedAt: new Date(updatedAt)
  }))
]

const generateHeavyCorpus = (): GeneratedPage[] => {
  const random = createRandom(SEED)
  const workdays = getWorkdays()
  return [
    ...TEAMS.flatMap((team, index) =>
      generateTeamPages(random, team, workdays, 1_000_000 + index * 1000)
    ),
    ...generateDocPages(random)
  ]
}

export const HEAVY_CORPUS: EvalCorpus = {
  name: 'heavy',
  userId: 'eval|pagesSearchHeavy',
  email: 'pages-search-heavy-eval@example.com',
  preferredName: 'Pages Search Heavy Eval',
  loadFixtures: () =>
    generateHeavyCorpus().map(({key, content, updatedAt}) => toFixture(key, content, updatedAt))
}

export default generateHeavyCorpus
