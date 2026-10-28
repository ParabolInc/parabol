import {readFileSync} from 'node:fs'
import process from 'node:process'

const METRICS = [
  'queries',
  'nDCG10',
  'recall5',
  'mrr',
  'zeroResultRate',
  'errors',
  'p50Ms',
  'p90Ms'
]

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
const widths = lines[0].map((_, column) => Math.max(...lines.map((cells) => cells[column].length)))

console.log(`a: ${a.label} ${a.set} ${a.mode} (${pathA})`)
console.log(`b: ${b.label} ${b.set} ${b.mode} (${pathB})`)
if (listUnindexed(a) !== listUnindexed(b)) {
  console.log(
    `Warning: a and b were scored against different indexes. Unindexed in a: ${listUnindexed(a)}. Unindexed in b: ${listUnindexed(b)}.`
  )
}
console.log('n = queries in the row, answerable or not. delta = b - a\n')
for (const cells of lines) {
  console.log(
    cells
      .map((cell, column) => cell.padEnd(widths[column]))
      .join('  ')
      .trimEnd()
  )
}
