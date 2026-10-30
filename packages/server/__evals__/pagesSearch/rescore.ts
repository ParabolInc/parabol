import {readFileSync} from 'fs'
import {
  type Grades,
  junkAt,
  type Metrics,
  ndcgAt,
  type QueryResult,
  recallAt,
  reciprocalRank,
  summarize
} from './metrics'

export interface LabeledQuery {
  query: string
  relevant: Record<string, number>
}

export type RankedQuery = Pick<QueryResult, 'query' | 'category' | 'resultKeys' | 'latencyMs'>

export type ExtraGrades = Record<string, Record<string, unknown>>

export type GradingPool = Record<string, string[]>

export const rescore = (
  perQuery: RankedQuery[],
  labeledQueries: LabeledQuery[],
  extraGrades: ExtraGrades = {}
): Metrics => {
  const idByKey = new Map<string, number>()
  const idOf = (key: string) => {
    const id = idByKey.get(key) ?? idByKey.size + 1
    idByKey.set(key, id)
    return id
  }
  const labelsByQuery = new Map(labeledQueries.map((labeled) => [labeled.query, labeled.relevant]))
  return summarize(
    perQuery.map((result, idx) => {
      const labels = labelsByQuery.get(result.query)
      if (!labels) throw new Error(`Result ${idx} has no labeled query`)
      const answerable = Object.keys(labels).length > 0
      const grades: Grades = new Map()
      for (const [key, grade] of Object.entries({
        ...(answerable ? extraGrades[result.query] : undefined),
        ...labels
      })) {
        if (grade === 1 || grade === 2 || grade === 3) grades.set(idOf(key), grade)
      }
      const resultIds = result.resultKeys.map(idOf)
      return {
        ...result,
        answerable,
        resultIds,
        nDCG10: ndcgAt(10, resultIds, grades),
        recall5: recallAt(5, resultIds, grades),
        recall20: recallAt(20, resultIds, grades),
        junkAt5: junkAt(5, resultIds, grades),
        reciprocalRank: reciprocalRank(resultIds, grades)
      }
    })
  )
}

const isGrade = (grade: unknown) => grade === 0 || grade === 1 || grade === 2 || grade === 3

export const checkExtraGrades = (pool: GradingPool, extraGrades: ExtraGrades) => {
  const pairKey = (query: string, key: string) => `${query}\u0000${key}`
  const pooled = new Set(
    Object.entries(pool).flatMap(([query, keys]) => keys.map((key) => pairKey(query, key)))
  )
  const graded = Object.entries(extraGrades).flatMap(([query, grades]) =>
    Object.entries(grades).map(([key, grade]) => ({pair: pairKey(query, key), grade}))
  )
  const gradedPairs = new Set(graded.map(({pair}) => pair))
  const ungraded = [...pooled].filter((pair) => !gradedPairs.has(pair)).length
  const outside = [...gradedPairs].filter((pair) => !pooled.has(pair)).length
  const malformed = graded.filter(({grade}) => !isGrade(grade)).length
  if (ungraded + outside + malformed === 0) return null
  return `Extra grades: ${ungraded} pooled pairs ungraded, ${outside} pairs outside the pool, ${malformed} grades not 0, 1, 2 or 3`
}

const readJson = (path: string) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    throw new Error(`${path} is not readable JSON`)
  }
}

if (require.main === module) {
  const [resultsPath, queriesPath, poolPath, extraGradesPath] = process.argv.slice(2)
  if (!resultsPath || !queriesPath || !poolPath !== !extraGradesPath) {
    throw new Error(
      'Usage: rescore.ts <results.json> <queries.json> [<pool.json> <extraGrades.json>]'
    )
  }
  const results = readJson(resultsPath)
  const configs: {alpha?: number; floor?: number; perQuery: (RankedQuery & {error?: string})[]}[] =
    results.configs ?? [results]
  if (configs.length !== 1) throw new Error('Rescore a fused result or a one-row sweep')
  const [{alpha, floor, perQuery}] = configs as [(typeof configs)[number]]
  const errors = perQuery.filter(({error}) => error).length
  if (errors > 0)
    throw new Error(`${errors} queries errored; rerun this arm without opening its log`)
  const extraGrades: ExtraGrades = extraGradesPath ? readJson(extraGradesPath) : {}
  if (poolPath) {
    const problem = checkExtraGrades(readJson(poolPath), extraGrades)
    if (problem) throw new Error(problem)
  }
  const {nDCG10, recall20, mrr, junkAt5, noAnswerResults} = rescore(
    perQuery,
    readJson(queriesPath),
    extraGrades
  )
  console.log(
    JSON.stringify({
      modelId: results.modelId ?? null,
      alpha: alpha ?? null,
      floor: floor ?? null,
      unindexed: results.unindexed,
      nDCG10,
      recall20,
      mrr,
      junkAt5,
      noAnswerResults
    })
  )
}
