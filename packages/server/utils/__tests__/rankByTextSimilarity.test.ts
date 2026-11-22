import rankByTextSimilarity from '../rankByTextSimilarity'

const issues = [
  {key: 'A-1', text: 'Fix typo on the billing page'},
  {key: 'A-2', text: 'Migrate the meetings table to Postgres with a backfill'},
  {key: 'A-3', text: 'Update the onboarding copy'},
  {key: 'A-4', text: 'Backfill the Postgres meeting members table'}
]
const rank = (query: string) =>
  rankByTextSimilarity(query, issues, ({text}) => text).map(({key}) => key)

test('ranks issues that share rarer words with the query first', () => {
  expect(rank('Move the teams table to Postgres and backfill it').slice(0, 2)).toEqual([
    'A-2',
    'A-4'
  ])
})

test('keeps the given order when nothing matches', () => {
  expect(rank('Zoom transcripts')).toEqual(['A-1', 'A-2', 'A-3', 'A-4'])
})

test('ignores case and punctuation', () => {
  expect(rank('ONBOARDING copy!')[0]).toBe('A-3')
})
