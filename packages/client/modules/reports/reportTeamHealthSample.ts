import dayjs from 'dayjs'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import type {ReportRowTotal} from './reportHeatmapGrid'
import type {ReportResultRow} from './reportRows'
import type {ReportTeamHealthCheck} from './reportTeamHealthCells'
import type {ReportTeamHealthAllTeamsRows} from './reportTeamHealthRows'

// A made-up organization's Team Health heatmap, shown faded behind the prompt to run a first check, so an org that
// hasn't run one sees what it will get
const CATEGORIES = [
  {id: 'safety', name: 'Psychological Safety'},
  {id: 'dependability', name: 'Dependability'},
  {id: 'clarity', name: 'Structure & Clarity'},
  {id: 'meaning', name: 'Meaning'},
  {id: 'impact', name: 'Impact'}
]

type CategoryScores = [latest: number, previous: number, beforeThat: number]

// each category's score in the latest check, the period before, and the check before that
const TEAMS: {
  id: string
  name: string
  respondentCount: number
  memberCount: number
  checkNumber: number
  checkedDaysAgo: number
  scores: CategoryScores[]
}[] = [
  {
    id: 'platform',
    name: 'Platform',
    respondentCount: 6,
    memberCount: 7,
    checkNumber: 4,
    checkedDaysAgo: 12,
    scores: [
      [4.4, 4.1, 4.0],
      [3.9, 3.8, 3.6],
      [3.6, 3.7, 3.5],
      [4.2, 3.9, 3.8],
      [3.8, 3.5, 3.4]
    ]
  },
  {
    id: 'mobile',
    name: 'Mobile',
    respondentCount: 5,
    memberCount: 5,
    checkNumber: 3,
    checkedDaysAgo: 20,
    scores: [
      [4.0, 3.8, 3.9],
      [3.5, 3.6, 3.4],
      [3.2, 3.0, 3.1],
      [3.9, 3.9, 3.7],
      [3.4, 3.2, 3.3]
    ]
  },
  {
    id: 'design',
    name: 'Design',
    respondentCount: 4,
    memberCount: 4,
    checkNumber: 5,
    checkedDaysAgo: 8,
    scores: [
      [4.6, 4.3, 4.1],
      [4.1, 3.9, 4.0],
      [3.8, 3.5, 3.6],
      [4.8, 4.5, 4.4],
      [4.2, 4.0, 3.9]
    ]
  },
  {
    id: 'data',
    name: 'Data',
    respondentCount: 5,
    memberCount: 6,
    checkNumber: 2,
    checkedDaysAgo: 25,
    scores: [
      [3.7, 3.6, 3.8],
      [3.3, 3.5, 3.4],
      [2.6, 3.1, 3.4],
      [3.5, 3.4, 3.6],
      [3.1, 3.3, 3.0]
    ]
  },
  {
    id: 'support',
    name: 'Support',
    respondentCount: 6,
    memberCount: 8,
    checkNumber: 4,
    checkedDaysAgo: 15,
    scores: [
      [2.1, 3.0, 3.6],
      [2.8, 3.1, 3.0],
      [2.9, 2.7, 2.8],
      [3.0, 3.2, 3.1],
      [2.5, 2.6, 2.9]
    ]
  }
]

// the cells whose summaries and answers earn a mark: a high, a medium and a low, and a bright spot. Their answers
// spread as far as the mark needs
const READINGS: Record<
  string,
  {sentimentScore: number; spreadScores: number[]; commentCount: number}
> = {
  'support:safety': {sentimentScore: -0.9, spreadScores: [1, 2, 2, 4, 5, 5], commentCount: 5},
  'data:clarity': {sentimentScore: -0.7, spreadScores: [1, 2, 3, 3, 5], commentCount: 3},
  'support:impact': {sentimentScore: -0.5, spreadScores: [2, 2, 3, 3, 4, 5], commentCount: 3},
  'design:meaning': {sentimentScore: 0.9, spreadScores: [4, 4, 5, 5], commentCount: 3}
}

// answers split between neighbors, too close together to mark
const toCalmReading = (respondentCount: number) => ({
  sentimentScore: 0.3,
  spreadScores: Array.from({length: respondentCount}, (_, idx) =>
    idx < respondentCount / 2 ? 3 : 4
  ),
  commentCount: 1
})

const average = (scores: number[]) =>
  Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10

const toKey = (value: string, label: string) => ({value, label, isPartial: false})

export const SAMPLE_TEAM_HEALTH_SPEC: ReportSpec = {
  measures: ['HEALTH_SCORE'],
  breakdown: [{dimension: 'TEAM'}, {dimension: 'CATEGORY'}],
  filters: [],
  where: [],
  compareTo: 'PREVIOUS_PERIOD',
  showAs: 'HEATMAP'
}

export const SAMPLE_TEAM_HEALTH_ROWS: ReportResultRow[] = TEAMS.flatMap((team) =>
  CATEGORIES.map((category, idx) => ({
    keys: [toKey(team.id, team.name), toKey(category.id, category.name)],
    values: [team.scores[idx]![0]],
    previousValues: [team.scores[idx]![1]]
  }))
)

export const SAMPLE_TEAM_HEALTH_ROW_TOTALS: ReportRowTotal[] = TEAMS.map((team) => ({
  keys: [{value: team.id}],
  values: [average(team.scores.map(([latest]) => latest))],
  previousValues: [average(team.scores.map(([, previous]) => previous))]
}))

export const SAMPLE_TEAM_HEALTH_ALL_TEAMS: ReportTeamHealthAllTeamsRows = {
  allTeams: CATEGORIES.map((category, idx) => ({
    keys: [{value: category.id}],
    values: [average(TEAMS.map((team) => team.scores[idx]![0]))]
  })),
  allTeamsTotal: {
    keys: [],
    values: [average(TEAMS.flatMap((team) => team.scores.map(([latest]) => latest)))]
  }
}

export const SAMPLE_TEAM_HEALTH_CHECKS: ReportTeamHealthCheck[] = TEAMS.map((team) => ({
  meetingId: `sample:${team.id}`,
  teamId: team.id,
  endedAt: dayjs().subtract(team.checkedDaysAgo, 'day').toISOString(),
  checkNumber: team.checkNumber,
  respondentCount: team.respondentCount,
  memberCount: team.memberCount,
  stages: CATEGORIES.map((category, idx) => {
    const [, previous, beforeThat] = team.scores[idx]!
    const reading = READINGS[`${team.id}:${category.id}`] ?? toCalmReading(team.respondentCount)
    return {
      id: `sample:${team.id}:${category.id}`,
      respondentCount: reading.spreadScores.length,
      commentCount: reading.commentCount,
      spreadScores: reading.spreadScores,
      sentimentScore: reading.sentimentScore,
      isLoadingSummary: false,
      scoreHistory: [{score: beforeThat}, {score: previous}],
      healthQuestion: {category: {id: category.id}}
    }
  })
}))
