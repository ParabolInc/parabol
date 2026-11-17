import fs from 'fs'
import path from 'path'
import generateHeavyCorpus from '../heavyCorpus/generateHeavyCorpus'
import toFixture from '../toFixture'

interface HeavyQuery {
  query: string
  category: string
  relevant: Record<string, number>
}

const QUERY_FILES = ['heavyQueries.json', 'heavyHoldoutQueries.json', 'heavyFinalQueries.json']

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

const LONG_DOC_ANSWERS: Record<string, string> = {
  'stale pgbouncer connections after failover':
    'pgbouncer keeps stale connections for up to a minute',
  'how long are rate limit rejections logged before enforcing':
    'We log would-be rejections for two weeks',
  'which accounts move to the new session store first':
    'We switch reads team by team, starting with internal accounts',
  'when are on-call handoff notes due': 'Write handoff notes on Monday morning',
  'how long to publish both saml certificates':
    'Publish both certificates in our metadata for a week',
  'who splits time between growth and escalations':
    'Owen splits his time between growth and customer escalations'
}

const pages = generateHeavyCorpus()
const pageKeys = new Set(pages.map(({key}) => key))

const readQueries = (fileName: string): HeavyQuery[] =>
  JSON.parse(fs.readFileSync(path.join(__dirname, '..', fileName), 'utf8'))

const findQueryProblems = (queries: HeavyQuery[]) => {
  const seen = new Set<string>()
  const problems = queries.flatMap(({query, category, relevant}, index) => {
    const label = `query ${index + 1}`
    const normalized = query.trim().toLowerCase()
    const grades = Object.entries(relevant)
    const isRepeat = seen.has(normalized)
    seen.add(normalized)
    return [
      !normalized && `${label} is blank`,
      isRepeat && `${label} repeats an earlier query`,
      !CATEGORIES.includes(category) && `${label} has an unknown category`,
      grades.some(([key]) => !pageKeys.has(key)) &&
        `${label} grades a page that is not in the corpus`,
      grades.some(([, grade]) => ![1, 2, 3].includes(grade)) &&
        `${label} has a grade other than 1, 2 or 3`,
      category === 'noAnswer' && grades.length > 0 && `${label} grades a page but has no answer`,
      category !== 'noAnswer' &&
        !grades.some(([, grade]) => grade === 3) &&
        `${label} has no page graded 3`
    ].filter((problem): problem is string => !!problem)
  })
  const noAnswerCount = queries.filter(({category}) => category === 'noAnswer').length
  return noAnswerCount < 4 ? [...problems, 'fewer than 4 queries have no answer'] : problems
}

it('describes problems without quoting queries or labels', () => {
  const problems = findQueryProblems([
    {query: 'quarterly secret', category: 'gossip', relevant: {'no-such-page': 5}}
  ])
  expect(problems).toEqual([
    'query 1 has an unknown category',
    'query 1 grades a page that is not in the corpus',
    'query 1 has a grade other than 1, 2 or 3',
    'query 1 has no page graded 3',
    'fewer than 4 queries have no answer'
  ])
  expect(problems.join(' ')).not.toMatch(/quarterly|secret|gossip|no-such-page/)
})

it.each(QUERY_FILES)('%s has well-formed queries and labels', (fileName) => {
  expect(findQueryProblems(readQueries(fileName))).toEqual([])
})

it('shares no query text between heavy query files', () => {
  const queriesByFile = QUERY_FILES.map((fileName) => ({
    fileName,
    queries: readQueries(fileName).map(({query}) => query.trim().toLowerCase())
  }))
  const repeats = queriesByFile.flatMap(({fileName, queries}) => {
    const others = new Set(
      queriesByFile.filter((other) => other.fileName !== fileName).flatMap((other) => other.queries)
    )
    return queries.flatMap((query, index) =>
      others.has(query) ? [`${fileName} query ${index + 1} repeats a query in another file`] : []
    )
  })
  expect(repeats).toEqual([])
})

it('puts each dev longDoc answer in the second half of its doc', () => {
  const plaintextByKey = new Map(
    pages.map(({key, content}) => [key, toFixture(key, content).plaintextContent])
  )
  const shallow = readQueries('heavyQueries.json')
    .filter(({category}) => category === 'longDoc')
    .filter(({query, relevant}) => {
      const [docKey] = Object.entries(relevant).find(([, grade]) => grade === 3) ?? []
      const text = plaintextByKey.get(docKey ?? '') ?? ''
      const answer = LONG_DOC_ANSWERS[query]
      return !answer || !(text.indexOf(answer) > text.length / 2)
    })
  expect(shallow.map(({query}) => query)).toEqual([])
})
