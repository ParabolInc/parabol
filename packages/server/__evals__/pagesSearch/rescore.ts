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

type RankedQuery = Pick<QueryResult, 'query' | 'category' | 'resultKeys' | 'latencyMs'>

export type ExtraGrades = Record<string, Record<string, number>>

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

const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8'))

if (require.main === module) {
  const [resultsPath, queriesPath, extraGradesPath] = process.argv.slice(2)
  if (!resultsPath || !queriesPath) {
    throw new Error('Usage: rescore.ts <results.json> <queries.json> [extraGrades.json]')
  }
  const results = readJson(resultsPath)
  const configs: {perQuery: RankedQuery[]}[] = results.configs ?? [results]
  if (configs.length !== 1) throw new Error('Rescore a fused result or a one-row sweep')
  const {nDCG10, recall20, mrr, junkAt5, noAnswerResults} = rescore(
    configs[0]!.perQuery,
    readJson(queriesPath),
    extraGradesPath ? readJson(extraGradesPath) : {}
  )
  console.log(JSON.stringify({nDCG10, recall20, mrr, junkAt5, noAnswerResults}))
}
