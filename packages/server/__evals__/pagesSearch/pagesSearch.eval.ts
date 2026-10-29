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
import {RRF_K} from '../../postgres/expressions'
import getKysely from '../../postgres/getKysely'
import {getPagesByRRF} from '../../postgres/queries/getPagesByRRF'
import type {User} from '../../postgres/types'
import {Logger} from '../../utils/Logger'
import {HEAVY_CORPUS} from './heavyCorpus/generateHeavyCorpus'
import {
  type Grade,
  type Grades,
  junkAt,
  type Metrics,
  ndcgAt,
  type QueryResult,
  recallAt,
  reciprocalRank,
  summarize
} from './metrics'
import parseFractions from './parseFractions'
import {type EvalCorpus, FIXTURES_CORPUS, seedEvalPages} from './seedEvalPages'

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

type SearchMode = 'fused' | 'quick'
type Mode = SearchMode | 'sweep'

interface EmbeddingOutcome {
  embeddingMs?: number
  embeddingError?: string
}

type ScoredQuery = QueryResult & EmbeddingOutcome & {fallbackReason?: string}

type SummarizedMetrics = ReturnType<typeof summarizeWithErrors>

interface SweepConfig {
  alpha: number
  floor: number
}

interface SweepResult extends SweepConfig {
  overall: SummarizedMetrics
  byCategory: Record<string, SummarizedMetrics>
  perQuery: QueryResult[]
}

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

const EVAL_SETS = {
  dev: {queryFile: 'queries.json', corpus: FIXTURES_CORPUS},
  holdout: {queryFile: 'holdoutQueries.json', corpus: FIXTURES_CORPUS},
  'heavy-dev': {queryFile: 'heavyQueries.json', corpus: HEAVY_CORPUS},
  'heavy-holdout': {queryFile: 'heavyHoldoutQueries.json', corpus: HEAVY_CORPUS}
} satisfies Record<string, {queryFile: string; corpus: EvalCorpus}>

type EvalSet = keyof typeof EVAL_SETS
const RESULTS_DIR = path.join(__dirname, 'results')
const RESULTS_REQUESTED = 20
const DEFAULT_SWEEP_ALPHAS = '0.25,0.5,0.75'
const DEFAULT_SWEEP_FLOORS = '0.3,0.35,0.4,0.45,0.5'
const SWEEP_TABLE_METRICS = [
  'nDCG10',
  'recall5',
  'mrr',
  'zeroResultRate',
  'junkAt5',
  'noAnswerResults'
] as const

const isEvalSet = (value: string): value is EvalSet => Object.hasOwn(EVAL_SETS, value)

const parseEvalSet = (value: string): EvalSet => {
  if (isEvalSet(value)) return value
  throw new Error(`EVAL_SET must be one of ${Object.keys(EVAL_SETS).join(', ')}, got "${value}"`)
}

const parseModes = (value: string) =>
  value.split(',').map((mode): Mode => {
    const trimmed = mode.trim()
    if (trimmed === 'fused' || trimmed === 'quick' || trimmed === 'sweep') return trimmed
    throw new Error(`EVAL_MODES must list fused, quick and/or sweep, got "${value}"`)
  })

const parseLabel = (value: string) => {
  if (/^[\w.-]+$/.test(value)) return value
  throw new Error(`EVAL_LABEL may only hold letters, digits, dots, dashes and underscores`)
}

const parseSweepConfigs = (): SweepConfig[] => {
  const alphas = parseFractions('EVAL_ALPHAS', process.env.EVAL_ALPHAS ?? DEFAULT_SWEEP_ALPHAS)
  const floors = parseFractions('EVAL_FLOORS', process.env.EVAL_FLOORS ?? DEFAULT_SWEEP_FLOORS)
  return alphas.flatMap((alpha) => floors.map((floor) => ({alpha, floor})))
}

const gradeQueries = (evalSet: EvalSet, pageIdByFixture: Map<string, number>): GradedQuery[] => {
  const fileName = EVAL_SETS[evalSet].queryFile
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

const toResultIds = (nodeIds: (string | number)[]) => {
  const resultIds = nodeIds.map(Number)
  if (new Set(resultIds).size !== resultIds.length) {
    throw new Error('Search returned the same page more than once')
  }
  return resultIds
}

const searchPages = async (query: string, mode: SearchMode, viewerId: string) => {
  if (typeof search !== 'function') throw new Error('search must be a resolver function')
  const dataLoader = getNewDataLoader('pagesSearchEval')
  const context = {authToken: {sub: viewerId, tms: []}, dataLoader} as unknown as GQLContext
  try {
    const connection = await search(
      {} as User,
      {query, first: RESULTS_REQUESTED, type: 'page', alpha: mode === 'quick' ? 0 : undefined},
      context,
      {} as GraphQLResolveInfo
    )
    const edges = await Promise.all(connection.edges)
    return toResultIds(edges.map(({nodeId}) => nodeId))
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

const toQueryResult = (
  {query, category, grades}: GradedQuery,
  resultIds: number[],
  fixtureKeyByPageId: Map<number, string>,
  latencyMs: number,
  error: string | undefined
): QueryResult => ({
  query,
  category,
  answerable: grades.size > 0,
  nDCG10: ndcgAt(10, resultIds, grades),
  recall5: recallAt(5, resultIds, grades),
  junkAt5: junkAt(5, resultIds, grades),
  reciprocalRank: reciprocalRank(resultIds, grades),
  resultIds,
  resultKeys: resultIds.map((id) => fixtureKeyByPageId.get(id) ?? String(id)),
  latencyMs,
  error
})

const scoreQuery = async (
  gradedQuery: GradedQuery,
  mode: SearchMode,
  fixtureKeyByPageId: Map<number, string>,
  viewerId: string
) => {
  warnSpy.mockClear()
  const startedAt = Date.now()
  let resultIds: number[] = []
  let error: string | undefined
  try {
    resultIds = await searchPages(gradedQuery.query, mode, viewerId)
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }
  const latencyMs = Date.now() - startedAt
  const [embeddingCall] = mockEmbeddingCalls.splice(0)
  const result: ScoredQuery = {
    ...toQueryResult(gradedQuery, resultIds, fixtureKeyByPageId, latencyMs, error),
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

const roundForTable = (value: number) => Math.round(value * 1000) / 1000

const toTableRow = (metrics: Metrics) =>
  Object.fromEntries(
    Object.entries(metrics).map(([metric, value]) => [metric, roundForTable(value)])
  )

const embedQueryVector = async (query: string) => {
  try {
    const embedding = await mockEmbedQueryText(query)
    return embedding instanceof Error ? embedding : Float32Array.from(embedding)
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error))
  }
}

const scoreSweepQuery = async (
  gradedQuery: GradedQuery,
  queryVector: Float32Array | Error,
  {alpha, floor}: SweepConfig,
  fixtureKeyByPageId: Map<number, string>,
  viewerId: string
) => {
  if (queryVector instanceof Error) {
    const error = `embedding failed: ${queryVector.message}`
    return toQueryResult(gradedQuery, [], fixtureKeyByPageId, 0, error)
  }
  const startedAt = Date.now()
  let resultIds: number[] = []
  let error: string | undefined
  try {
    const {edges} = await getPagesByRRF({
      query: gradedQuery.query,
      queryVector,
      alpha,
      k: RRF_K,
      first: RESULTS_REQUESTED,
      offset: 0,
      viewerId,
      teamIds: undefined,
      dateRange: null,
      vectorFloor: floor
    })
    resultIds = toResultIds(edges.map(({nodeId}) => nodeId))
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }
  const latencyMs = Date.now() - startedAt
  return toQueryResult(gradedQuery, resultIds, fixtureKeyByPageId, latencyMs, error)
}

const scoreSweep = async (
  gradedQueries: GradedQuery[],
  configs: SweepConfig[],
  fixtureKeyByPageId: Map<number, string>,
  viewerId: string
) => {
  await warmUpEmbeddings()
  const sweeps = configs.map((config) => ({...config, perQuery: [] as QueryResult[]}))
  for (const gradedQuery of gradedQueries) {
    const queryVector = await embedQueryVector(gradedQuery.query)
    for (const sweep of sweeps) {
      sweep.perQuery.push(
        await scoreSweepQuery(gradedQuery, queryVector, sweep, fixtureKeyByPageId, viewerId)
      )
    }
  }
  return sweeps.map(
    ({alpha, floor, perQuery}): SweepResult => ({
      alpha,
      floor,
      overall: summarizeWithErrors(perQuery),
      byCategory: summarizeByCategory(perQuery),
      perQuery
    })
  )
}

const toSweepRow = ({alpha, floor, overall}: SweepResult) => ({
  alpha,
  floor,
  ...Object.fromEntries(
    SWEEP_TABLE_METRICS.map((metric) => [metric, roundForTable(overall[metric])])
  )
})

interface SweepRun {
  label: string
  evalSet: EvalSet
  unindexed: string[]
  gradedQueries: GradedQuery[]
  configs: SweepConfig[]
  fixtureKeyByPageId: Map<number, string>
  viewerId: string
}

const runSweep = async ({
  label,
  evalSet,
  unindexed,
  gradedQueries,
  configs,
  fixtureKeyByPageId,
  viewerId
}: SweepRun) => {
  const sweepResults = await scoreSweep(gradedQueries, configs, fixtureKeyByPageId, viewerId)
  const resultsPath = path.join(RESULTS_DIR, `${label}-${evalSet}-sweep.json`)
  const results = {label, set: evalSet, mode: 'sweep', unindexed, configs: sweepResults}
  fs.writeFileSync(resultsPath, `${JSON.stringify(results, null, 2)}\n`)
  console.log(`${label} ${evalSet} sweep: ${resultsPath}`)
  console.table(
    [...sweepResults]
      .sort((first, second) => second.overall.nDCG10 - first.overall.nDCG10)
      .map(toSweepRow)
  )
  const failed = sweepResults.flatMap(({alpha, floor, perQuery}) =>
    perQuery
      .filter(({error}) => error !== undefined)
      .map(({query, error}) => ({query, alpha, floor, error}))
  )
  const [firstFailed] = failed
  if (firstFailed) {
    console.warn(
      `${failed.length} sweep result lists failed. First, "${firstFailed.query}" at alpha ${firstFailed.alpha}, floor ${firstFailed.floor}: ${firstFailed.error}`
    )
  }
  return failed.map(
    ({query, alpha, floor, error}) => `sweep alpha ${alpha} floor ${floor} "${query}": ${error}`
  )
}

const dumpCorpus = (corpus: EvalCorpus) => {
  const dumpDir = path.join(RESULTS_DIR, `${corpus.name}-corpus`)
  fs.rmSync(dumpDir, {recursive: true, force: true})
  fs.mkdirSync(dumpDir, {recursive: true})
  const fixtures = corpus.loadFixtures()
  for (const {key, title, plaintextContent} of fixtures) {
    fs.writeFileSync(path.join(dumpDir, `${key}.md`), `${title}\n\n${plaintextContent}\n`)
  }
  const index = fixtures.map(({key, title, plaintextContent, updatedAt}) => ({
    key,
    title,
    chars: plaintextContent.length,
    updatedAt: updatedAt?.toISOString()
  }))
  fs.writeFileSync(path.join(dumpDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`)
  console.log(`Wrote ${fixtures.length} pages to ${dumpDir}`)
}

afterAll(async () => {
  await getKysely().destroy()
})

test('pages search eval', async () => {
  const evalSet = parseEvalSet(process.env.EVAL_SET ?? 'dev')
  const modes = parseModes(process.env.EVAL_MODES ?? 'fused')
  const label = parseLabel(process.env.EVAL_LABEL ?? 'local')
  const sweepConfigs = modes.includes('sweep') ? parseSweepConfigs() : []
  const {corpus} = EVAL_SETS[evalSet]
  if (process.env.EVAL_DUMP === '1') {
    dumpCorpus(corpus)
    return
  }
  const {pageIdByFixture, unindexed} = await seedEvalPages({
    corpus,
    reseed: process.env.EVAL_RESEED === '1'
  })
  const gradedQueries = gradeQueries(evalSet, pageIdByFixture)
  const fixtureKeyByPageId = new Map([...pageIdByFixture].map(([key, pageId]) => [pageId, key]))

  fs.mkdirSync(RESULTS_DIR, {recursive: true})
  const failures: string[] = []
  for (const mode of modes) {
    if (mode === 'sweep') {
      failures.push(
        ...(await runSweep({
          label,
          evalSet,
          unindexed,
          gradedQueries,
          configs: sweepConfigs,
          fixtureKeyByPageId,
          viewerId: corpus.userId
        }))
      )
      continue
    }
    if (mode === 'fused') await warmUpEmbeddings()
    const perQuery: ScoredQuery[] = []
    for (const gradedQuery of gradedQueries) {
      perQuery.push(await scoreQuery(gradedQuery, mode, fixtureKeyByPageId, corpus.userId))
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
