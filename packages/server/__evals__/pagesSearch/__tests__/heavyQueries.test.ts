import fs from 'fs'
import path from 'path'
import generateHeavyCorpus from '../heavyCorpus/generateHeavyCorpus'

interface HeavyQuery {
  query: string
  category: string
  relevant: Record<string, number>
}

const CATEGORIES = [
  'title',
  'prefix',
  'body',
  'paraphrase',
  'typo',
  'table',
  'longDoc',
  'person',
  'noAnswer'
]

const pageKeys = new Set(generateHeavyCorpus().map(({key}) => key))

const readQueries = (fileName: string): HeavyQuery[] =>
  JSON.parse(fs.readFileSync(path.join(__dirname, '..', fileName), 'utf8'))

const QUERY_FILES = ['heavyQueries.json', 'heavyHoldoutQueries.json']

describe.each(QUERY_FILES)('%s', (fileName) => {
  const queries = readQueries(fileName)

  it('has non-blank, unique queries', () => {
    expect(queries.filter(({query}) => !query.trim())).toEqual([])
    expect(new Set(queries.map(({query}) => query)).size).toBe(queries.length)
  })

  it('uses the heavy corpus categories', () => {
    expect(queries.filter(({category}) => !CATEGORIES.includes(category))).toEqual([])
  })

  it('grades generated pages 1, 2 or 3', () => {
    const badLabels = queries.flatMap(({query, relevant}) =>
      Object.entries(relevant)
        .filter(([key, grade]) => !pageKeys.has(key) || ![1, 2, 3].includes(grade))
        .map(([key, grade]) => `${query}: ${key} ${grade}`)
    )
    expect(badLabels).toEqual([])
  })

  it('gives every answerable query the page the user wants', () => {
    const misgraded = queries.filter(({category, relevant}) => {
      const grades = Object.values(relevant)
      return category === 'noAnswer' ? grades.length > 0 : !grades.includes(3)
    })
    expect(misgraded.map(({query}) => query)).toEqual([])
  })

  it('has queries without an answer', () => {
    expect(queries.filter(({category}) => category === 'noAnswer').length).toBeGreaterThanOrEqual(4)
  })
})

it('shares no query text between dev and holdout', () => {
  const [devQueries, holdoutQueries] = QUERY_FILES.map((fileName) =>
    readQueries(fileName).map(({query}) => query.trim().toLowerCase())
  )
  const holdout = new Set(holdoutQueries)
  expect(devQueries!.filter((query) => holdout.has(query))).toEqual([])
})
