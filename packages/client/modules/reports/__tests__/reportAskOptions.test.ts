import dayjs from 'dayjs'
import {type ReportAskPopular, type ReportAskRecent, toReportAskOptions} from '../reportAskOptions'

const spec = (showAs: string, breakdown: string[] = []) =>
  JSON.stringify({
    measures: ['MEETINGS'],
    breakdown: breakdown.map((dimension) => ({dimension})),
    period: {preset: 'PAGE'},
    showAs
  })

const populars: ReportAskPopular[] = [
  {
    id: 'p1',
    key: 'activePeopleOverTime',
    subject: 'people',
    question: 'How many people are active?',
    title: 'Active people over time',
    spec: spec('NUMBER')
  },
  {
    id: 'p2',
    key: 'retroTasksDoneOrOpen',
    subject: 'impact',
    question: 'Are tasks from retros getting done?',
    title: 'New tasks, done or open',
    spec: spec('BARS', ['TEAM'])
  },
  {
    id: 'p3',
    key: 'retroCadence',
    subject: 'teams',
    question: 'Which teams keep up their monthly retros?',
    title: 'Retrospective cadence',
    spec: spec('HEATMAP', ['TEAM', 'MONTH'])
  }
]

const recents: ReportAskRecent[] = ['First', 'Second', 'Third', 'Fourth'].map((name, idx) => ({
  id: `r${idx}`,
  question: `${name} question about retro tasks`,
  title: name,
  spec: spec('BARS', ['TEAM']),
  lastUsedAt: dayjs().toISOString()
}))

const labelsOf = (options: ReturnType<typeof toReportAskOptions>) =>
  options.map((option) =>
    option.kind === 'ask'
      ? `ask: ${option.question}`
      : `${option.group ?? option.section}: ${option.parts.map(({text}) => text).join('')}`
  )

test('with nothing typed, it lists the 3 newest recent questions, then the popular ones by subject', () => {
  expect(
    labelsOf(toReportAskOptions({query: '', recents, populars, suggestions: null, canAsk: true}))
  ).toEqual([
    'Recent: First question about retro tasks',
    'Recent: Second question about retro tasks',
    'Recent: Third question about retro tasks',
    'People: How many people are active?',
    'Impact: Are tasks from retros getting done?',
    'Teams: Which teams keep up their monthly retros?'
  ])
})

test('typing offers to ask AI first, keeps what matches any word, and marks the matches', () => {
  const options = toReportAskOptions({
    query: 'retro DONE',
    recents: [],
    populars,
    suggestions: null,
    canAsk: true
  })
  expect(labelsOf(options)).toEqual([
    'ask: retro DONE',
    'Popular questions: Are tasks from retros getting done?',
    'Popular questions: Which teams keep up their monthly retros?'
  ])
  const [, tasks] = options
  expect(
    tasks?.kind !== 'ask' && tasks?.parts.filter(({isMatch}) => isMatch).map(({text}) => text)
  ).toEqual(['retro', 'done'])
  expect(tasks?.kind !== 'ask' && tasks?.detail).toBe('New tasks, done or open · Bars')
})

test('with AI off, it only searches', () => {
  expect(
    labelsOf(
      toReportAskOptions({query: 'retro', recents: [], populars, suggestions: null, canAsk: false})
    )[0]
  ).toBe('Popular questions: Are tasks from retros getting done?')
})

test('when AI couldn’t answer, only the nearest popular questions are offered', () => {
  const options = toReportAskOptions({
    query: 'our velocity',
    recents,
    populars,
    suggestions: [populars[1]!],
    canAsk: true
  })
  expect(labelsOf(options)).toEqual([
    'Nearest popular questions: Are tasks from retros getting done?'
  ])
})

test('a recent question says how it was shown and when', () => {
  const [recent] = toReportAskOptions({
    query: '',
    recents,
    populars: [],
    suggestions: null,
    canAsk: true
  })
  expect(recent?.kind !== 'ask' && recent?.detail).toBe('Bars · Today')
})
