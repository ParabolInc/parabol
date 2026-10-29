import {readFileSync} from 'node:fs'
import process from 'node:process'

const METRICS = [
  'queries',
  'nDCG10',
  'recall5',
  'mrr',
  'zeroResultRate',
  'junkAt5',
  'noAnswerResults',
  'errors',
  'p50Ms',
  'p90Ms'
]
const MIN_QUERY_DELTA = 0.001
const TOP_KEYS_SHOWN = 3

const [pathA, pathB] = process.argv.slice(2)
if (!pathA || !pathB) {
  console.error('Usage: node compare.mjs <a.json> <b.json>')
  process.exit(1)
}

const a = JSON.parse(readFileSync(pathA, 'utf8'))
const b = JSON.parse(readFileSync(pathB, 'utf8'))

for (const field of ['set', 'mode']) {
  if (a[field] !== b[field]) {
    console.error(
      `Cannot compare runs with different ${field}s: a is ${a[field]}, b is ${b[field]}`
    )
    process.exit(1)
  }
}
if (a.mode === 'sweep') {
  console.error('compare.mjs reads fused and quick runs; sweep results print their own table')
  process.exit(1)
}

const formatDelta = (before, after) => {
  if (before === undefined || after === undefined) return 'n/a'
  const delta = Math.round((after - before) * 1000) / 1000
  return delta > 0 ? `+${delta}` : String(delta)
}

const metricsOf = (results, row) => (row === 'overall' ? results.overall : results.byCategory[row])

const countQueries = (results, row) =>
  results.perQuery.filter(({category}) => row === 'overall' || category === row).length

const formatCount = (row) => {
  const countA = countQueries(a, row)
  const countB = countQueries(b, row)
  return countA === countB ? String(countA) : `${countA}->${countB}`
}

const listUnindexed = (results) => [...results.unindexed].sort().join(', ') || 'none'

const categories = [...new Set([...Object.keys(a.byCategory), ...Object.keys(b.byCategory)])]
const lines = [
  ['', 'n', ...METRICS],
  ...['overall', ...categories].map((row) => [
    row,
    formatCount(row),
    ...METRICS.map((metric) =>
      formatDelta(metricsOf(a, row)?.[metric], metricsOf(b, row)?.[metric])
    )
  ])
]
const printAligned = (rows) => {
  const widths = rows[0].map((_, column) => Math.max(...rows.map((cells) => cells[column].length)))
  for (const cells of rows) {
    console.log(
      cells
        .map((cell, column) => cell.padEnd(widths[column]))
        .join('  ')
        .trimEnd()
    )
  }
}

console.log(`a: ${a.label} ${a.set} ${a.mode} (${pathA})`)
console.log(`b: ${b.label} ${b.set} ${b.mode} (${pathB})`)
if (listUnindexed(a) !== listUnindexed(b)) {
  console.log(
    `Warning: a and b were scored against different indexes. Unindexed in a: ${listUnindexed(a)}. Unindexed in b: ${listUnindexed(b)}.`
  )
}
console.log('n = queries in the row, answerable or not. delta = b - a\n')
printAligned(lines)

const withoutFloatNoise = (value) => Math.round(value * 1e6) / 1e6

const queriesOf = (results) => new Map(results.perQuery.map((result) => [result.query, result]))

const countMissingFrom = (queries, otherQueries) =>
  [...queries.keys()].filter((query) => !otherQueries.has(query)).length

const formatSignedDelta = (delta) => `${delta > 0 ? '+' : ''}${delta.toFixed(3)}`

const formatTopKeys = ({resultKeys}) =>
  resultKeys === undefined ? 'n/a' : resultKeys.slice(0, TOP_KEYS_SHOWN).join(', ') || 'none'

const queriesInA = queriesOf(a)
const queriesInB = queriesOf(b)
const unmatchedCount =
  countMissingFrom(queriesInA, queriesInB) + countMissingFrom(queriesInB, queriesInA)
const changes = [...queriesInA.values()].flatMap((before) => {
  const after = queriesInB.get(before.query)
  if (!after) return []
  const delta = withoutFloatNoise(after.nDCG10 - before.nDCG10)
  return Math.abs(delta) >= MIN_QUERY_DELTA ? [{before, after, delta}] : []
})
const wins = changes
  .filter(({delta}) => delta > 0)
  .sort((first, second) => second.delta - first.delta)
const losses = changes
  .filter(({delta}) => delta < 0)
  .sort((first, second) => first.delta - second.delta)

console.log()
if (unmatchedCount > 0) {
  console.log(`Warning: queries in only one of a and b are skipped. Count: ${unmatchedCount}.`)
}
if (changes.length === 0) {
  console.log('No per-query nDCG@10 changes.')
} else {
  console.log(
    `Per-query nDCG@10 changes of ${MIN_QUERY_DELTA} or more, wins first, with the first ${TOP_KEYS_SHOWN} result keys of a and b.\n`
  )
  printAligned(
    [...wins, ...losses].map(({before, after, delta}) => [
      formatSignedDelta(delta),
      before.category,
      JSON.stringify(before.query),
      `a: ${formatTopKeys(before)}`,
      `b: ${formatTopKeys(after)}`
    ])
  )
}
