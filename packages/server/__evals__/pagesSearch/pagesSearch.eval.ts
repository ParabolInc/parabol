import fs from 'fs'
import type {GraphQLResolveInfo} from 'graphql'
import path from 'path'
import {getModelManager} from '../../../embedder/ai_models/ModelManager'
import {getNewDataLoader} from '../../dataloader/getNewDataLoader'
import type {GQLContext} from '../../graphql/graphql'
import {
  KEYWORD_FALLBACK_LOG_MESSAGE,
  SEARCH_EMBEDDING_TIMEOUT_MS,
  search
} from '../../graphql/public/fields/search'
import getKysely from '../../postgres/getKysely'
import type {User} from '../../postgres/types'
import {Logger} from '../../utils/Logger'
import {
  type Grade,
  type Grades,
  type Metrics,
  ndcgAt,
  type QueryResult,
  recallAt,
  reciprocalRank,
  summarize
} from './metrics'
import {EVAL_USER_ID, seedEvalPages} from './seedEvalPages'

interface EmbeddingCall {
  startedAt: number
  durationMs?: number
  error?: string
}

const mockEmbeddingCalls: EmbeddingCall[] = []
const warnSpy = jest.spyOn(Logger, 'warn')
const mockEmbedQueryText = (queryText: string) =>
  getModelManager().getEmbedder().getEmbedding(queryText)

jest.mock('../../graphql/mutations/helpers/publishToEmbedder', () => ({
  getUserQueryJobData: (query: string) => ({query}),
  publishToEmbedder: async ({data}: {data: {query: string}}) => {
    const call: EmbeddingCall = {startedAt: Date.now()}
    mockEmbeddingCalls.push(call)
    try {
      const embedding = await mockEmbedQueryText(data.query)
      if (embedding instanceof Error) {
        call.error = embedding.message
        return embedding
      }
      return Float32Array.from(embedding)
    } catch (error) {
      call.error = error instanceof Error ? error.message : String(error)
      throw error
    } finally {
      call.durationMs = Date.now() - call.startedAt
    }
  }
}))

type EvalSet = 'dev' | 'holdout'
type Mode = 'fused' | 'quick'

interface EmbeddingOutcome {
  embeddingMs?: number
  embeddingError?: string
}

type ScoredQuery = QueryResult & EmbeddingOutcome & {fallbackReason?: string}

interface EvalQuery {
  query: string
  category: string
  relevant: Record<string, Grade>
}

interface GradedQuery {
  query: string
  category: string
  grades: Grades
}

const QUERY_FILES: Record<EvalSet, string> = {dev: 'queries.json', holdout: 'holdoutQueries.json'}
const RESULTS_DIR = path.join(__dirname, 'results')

const parseEvalSet = (value: string): EvalSet => {
  if (value === 'dev' || value === 'holdout') return value
  throw new Error(`EVAL_SET must be dev or holdout, got "${value}"`)
}

const parseModes = (value: string) =>
  value.split(',').map((mode): Mode => {
    const trimmed = mode.trim()
    if (trimmed === 'fused' || trimmed === 'quick') return trimmed
    throw new Error(`EVAL_MODES must list fused and/or quick, got "${value}"`)
  })

const parseLabel = (value: string) => {
  if (/^[\w.-]+$/.test(value)) return value
  throw new Error(`EVAL_LABEL may only hold letters, digits, dots, dashes and underscores`)
}

const gradeQueries = (evalSet: EvalSet, pageIdByFixture: Map<string, number>): GradedQuery[] => {
  const fileName = QUERY_FILES[evalSet]
  const queries: EvalQuery[] = JSON.parse(fs.readFileSync(path.join(__dirname, fileName), 'utf8'))
  return queries.map(({query, category, relevant}) => {
    if (!query.trim()) throw new Error(`${fileName} has a blank query`)
    const grades: Grades = new Map()
    for (const [fixtureKey, grade] of Object.entries(relevant)) {
      const pageId = pageIdByFixture.get(fixtureKey)
      if (pageId === undefined) {
        throw new Error(`Query "${query}" marks ${fixtureKey} relevant, but it is not a fixture`)
      }
      if (grade !== 1 && grade !== 2 && grade !== 3) {
        throw new Error(`Query "${query}" grades ${fixtureKey} ${grade}, not 1, 2 or 3`)
      }
      grades.set(pageId, grade)
    }
    return {query, category, grades}
  })
}

const warmUpEmbeddings = async () => {
  try {
    const embedding = await mockEmbedQueryText('warm up')
    if (embedding instanceof Error) throw embedding
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(`Could not warm up the embeddings service: ${reason}`)
  }
}

const searchPages = async (query: string, mode: Mode) => {
  if (typeof search !== 'function') throw new Error('search must be a resolver function')
  const dataLoader = getNewDataLoader('pagesSearchEval')
  const context = {authToken: {sub: EVAL_USER_ID, tms: []}, dataLoader} as unknown as GQLContext
  try {
    const connection = await search(
      {} as User,
      {query, first: 20, type: 'page', alpha: mode === 'quick' ? 0 : undefined},
      context,
      {} as GraphQLResolveInfo
    )
    const edges = await Promise.all(connection.edges)
    const resultIds = edges.map(({nodeId}) => Number(nodeId))
    if (new Set(resultIds).size !== resultIds.length) {
      throw new Error('Search returned the same page more than once')
    }
    return resultIds
  } finally {
    dataLoader.dispose()
  }
}

const toEmbeddingOutcome = (call: EmbeddingCall | undefined): EmbeddingOutcome => {
  if (!call) return {}
  if (call.durationMs === undefined) {
    return {
      embeddingMs: Date.now() - call.startedAt,
      embeddingError: 'still running when the search returned'
    }
  }
  return {embeddingMs: call.durationMs, embeddingError: call.error}
}

const toFallbackReason = (warnings: typeof warnSpy.mock.calls) => {
  const fallbackWarning = warnings.find(([message]) => message === KEYWORD_FALLBACK_LOG_MESSAGE)
  if (!fallbackWarning) return undefined
  const reason = fallbackWarning[1]?.extras?.reason
  return typeof reason === 'string' ? reason : 'unknown'
}

const describeEmbeddingProblem = ({embeddingMs, embeddingError}: EmbeddingOutcome) => {
  if (embeddingMs === undefined) return 'no embedding call was made'
  if (embeddingError !== undefined) return `embedding failed: ${embeddingError}`
  if (embeddingMs > SEARCH_EMBEDDING_TIMEOUT_MS) {
    return `embedding took ${embeddingMs} ms, over the ${SEARCH_EMBEDDING_TIMEOUT_MS} ms search budget`
  }
  return undefined
}

const describeFusedProblems = (result: ScoredQuery) =>
  [
    describeEmbeddingProblem(result),
    result.fallbackReason !== undefined && `search used keyword results: ${result.fallbackReason}`
  ]
    .filter(Boolean)
    .join('; ')

const scoreQuery = async (
  {query, category, grades}: GradedQuery,
  mode: Mode,
  fixtureKeyByPageId: Map<number, string>
) => {
  warnSpy.mockClear()
  const startedAt = Date.now()
  let resultIds: number[] = []
  let error: string | undefined
  try {
    resultIds = await searchPages(query, mode)
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }
  const latencyMs = Date.now() - startedAt
  const [embeddingCall] = mockEmbeddingCalls.splice(0)
  const result: ScoredQuery = {
    query,
    category,
    answerable: grades.size > 0,
    nDCG10: ndcgAt(10, resultIds, grades),
    recall5: recallAt(5, resultIds, grades),
    reciprocalRank: reciprocalRank(resultIds, grades),
    resultIds,
    resultKeys: resultIds.map((id) => fixtureKeyByPageId.get(id) ?? String(id)),
    latencyMs,
    error,
    ...toEmbeddingOutcome(embeddingCall),
    fallbackReason: toFallbackReason(warnSpy.mock.calls)
  }
  return result
}

const summarizeWithErrors = (results: QueryResult[]) => ({
  ...summarize(results),
  errors: results.filter(({error}) => error !== undefined).length
})

const summarizeByCategory = (perQuery: QueryResult[]) => {
  const resultsByCategory = new Map<string, QueryResult[]>()
  for (const result of perQuery) {
    const categoryResults = resultsByCategory.get(result.category) ?? []
    resultsByCategory.set(result.category, [...categoryResults, result])
  }
  return Object.fromEntries(
    [...resultsByCategory].map(([category, results]) => [category, summarizeWithErrors(results)])
  )
}

const toTableRow = (metrics: Metrics) =>
  Object.fromEntries(
    Object.entries(metrics).map(([metric, value]) => [metric, Math.round(value * 1000) / 1000])
  )

afterAll(async () => {
  await getKysely().destroy()
})

test('pages search eval', async () => {
  const evalSet = parseEvalSet(process.env.EVAL_SET ?? 'dev')
  const modes = parseModes(process.env.EVAL_MODES ?? 'fused')
  const label = parseLabel(process.env.EVAL_LABEL ?? 'local')
  const {pageIdByFixture, unindexed} = await seedEvalPages({
    reseed: process.env.EVAL_RESEED === '1'
  })
  const gradedQueries = gradeQueries(evalSet, pageIdByFixture)
  const fixtureKeyByPageId = new Map([...pageIdByFixture].map(([key, pageId]) => [pageId, key]))

  fs.mkdirSync(RESULTS_DIR, {recursive: true})
  const failures: string[] = []
  for (const mode of modes) {
    if (mode === 'fused') await warmUpEmbeddings()
    const perQuery: ScoredQuery[] = []
    for (const gradedQuery of gradedQueries) {
      perQuery.push(await scoreQuery(gradedQuery, mode, fixtureKeyByPageId))
    }
    const overall = summarizeWithErrors(perQuery)
    const byCategory = summarizeByCategory(perQuery)
    const resultsPath = path.join(RESULTS_DIR, `${label}-${evalSet}-${mode}.json`)
    const results = {label, set: evalSet, mode, overall, byCategory, perQuery, unindexed}
    fs.writeFileSync(resultsPath, `${JSON.stringify(results, null, 2)}\n`)
    console.log(`${label} ${evalSet} ${mode}: ${resultsPath}`)
    console.table({
      overall: toTableRow(overall),
      ...Object.fromEntries(
        Object.entries(byCategory).map(([category, metrics]) => [category, toTableRow(metrics)])
      )
    })
    const failed = perQuery.filter(({error}) => error !== undefined)
    const [firstFailed] = failed
    if (firstFailed) {
      console.warn(
        `${failed.length} of ${perQuery.length} ${mode} queries failed. First, "${firstFailed.query}": ${firstFailed.error}`
      )
      failures.push(...failed.map(({query, error}) => `${mode} "${query}": ${error}`))
    }
    if (mode === 'fused') {
      const keywordFallbacks = perQuery
        .filter(({error}) => error === undefined)
        .flatMap((result) => {
          const problem = describeFusedProblems(result)
          return problem ? [{query: result.query, problem}] : []
        })
      const [firstFallback] = keywordFallbacks
      if (firstFallback) {
        console.warn(
          `${keywordFallbacks.length} of ${perQuery.length} fused queries were not answered by fused ranking. First, "${firstFallback.query}": ${firstFallback.problem}`
        )
        failures.push(...keywordFallbacks.map(({query, problem}) => `fused "${query}": ${problem}`))
      }
    }
  }
  expect(failures).toEqual([])
})
