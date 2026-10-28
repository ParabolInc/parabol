import type {PopularReportQuestion} from '../popularReportQuestions'
import rankPopularReportQuestions from '../rankPopularReportQuestions'

const popular = (key: string, question: string, title: string): PopularReportQuestion => ({
  key,
  subject: 'teams',
  question,
  title,
  description: '',
  spec: {measures: ['MEETINGS'], breakdown: [], filters: [], where: [], showAs: 'NUMBER'}
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
