import type {ReportSpec} from '../../../client/shared/reports/reportCatalog'
import rankPopularReportQuestions from '../rankPopularReportQuestions'
import type {PopularReportQuestionRow} from '../selectPopularReportQuestions'
import toReportSpecShape from '../toReportSpecShape'

const spec: ReportSpec = {
  measures: ['MEETINGS'],
  breakdown: [{dimension: 'TEAM'}, {dimension: 'WEEK'}],
  filters: [
    {dimension: 'TEAM', values: ['team1', 'team2']},
    {dimension: 'MEETING_TYPE', values: ['teamPrompt']}
  ],
  where: [],
  period: {preset: null, startDate: '2026-09-01', endDate: '2026-09-30'},
  compareTo: null,
  showAs: 'HEATMAP',
  sort: null,
  limit: null
}

const popular = (key: string, question: string, title: string): PopularReportQuestionRow => ({
  id: 1,
  key,
  subject: 'teams',
  question,
  title,
  description: '',
  spec,
  defaultPinSortOrder: null
})

test('the shape swaps team ids and dates for placeholders', () => {
  expect(toReportSpecShape(spec)).toBe(
    'MEETINGS | TEAM, WEEK | TEAM=<team>, MEETING_TYPE=teamPrompt |  | <dates> |  | HEATMAP |  | '
  )
})

test('the nearest popular questions share the most words', () => {
  const populars = [
    popular('meetingsByType', 'How many meetings did we run each month?', 'Meetings by type'),
    popular(
      'retroTasksDoneOrOpen',
      'Are tasks from retros getting done?',
      'New tasks, done or open'
    ),
    popular('teamsNotMet30Days', 'Which teams haven’t met in 30 days?', 'Teams by last meeting')
  ]
  const nearest = rankPopularReportQuestions(
    'How many story points did retro tasks take?',
    populars,
    2
  )
  expect(nearest.map(({key}) => key)).toEqual(['retroTasksDoneOrOpen', 'meetingsByType'])
})
