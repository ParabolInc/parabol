import {readFileSync, writeFileSync} from 'fs'
import type {GradingPool, LabeledQuery, RankedQuery} from './rescore'

export const poolUnjudged = (
  arms: RankedQuery[][],
  labeledQueries: LabeledQuery[],
  depth = 10
): GradingPool => {
  const labelsByQuery = new Map(labeledQueries.map((labeled) => [labeled.query, labeled.relevant]))
  const pool: Record<string, Set<string>> = {}
  arms.forEach((perQuery, armIdx) =>
    perQuery.forEach(({query, resultKeys}, idx) => {
      const labels = labelsByQuery.get(query)
      if (!labels) throw new Error(`Arm ${armIdx} result ${idx} has no labeled query`)
      if (Object.keys(labels).length === 0) return
      const unjudged = (pool[query] ??= new Set())
      resultKeys
        .slice(0, depth)
        .filter((key) => !(key in labels))
        .forEach((key) => unjudged.add(key))
    })
  )
  return Object.fromEntries(
    Object.entries(pool)
      .filter(([, keys]) => keys.size > 0)
      .map(([query, keys]) => [query, [...keys].sort()])
  )
}

const readPerQuery = (path: string): RankedQuery[] => {
  const results = JSON.parse(readFileSync(path, 'utf8'))
  const configs: {perQuery: RankedQuery[]}[] = results.configs ?? [results]
  if (configs.length !== 1) throw new Error(`${path} is not a fused result or a one-row sweep`)
  return configs[0]!.perQuery
}

if (require.main === module) {
  const [queriesPath, poolPath, ...resultsPaths] = process.argv.slice(2)
  if (!queriesPath || !poolPath || resultsPaths.length === 0) {
    throw new Error('Usage: poolUnjudged.ts <queries.json> <pool.json> <results.json>...')
  }
  const pool = poolUnjudged(
    resultsPaths.map(readPerQuery),
    JSON.parse(readFileSync(queriesPath, 'utf8'))
  )
  writeFileSync(poolPath, `${JSON.stringify(pool, null, 2)}\n`)
  const pairs = Object.values(pool).reduce((sum, keys) => sum + keys.length, 0)
  console.log(`Pooled ${pairs} unjudged pages for ${Object.keys(pool).length} queries`)
}
