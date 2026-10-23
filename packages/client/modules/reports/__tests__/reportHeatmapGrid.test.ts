import {
  groupReportHeatmapRows,
  toReportHeatmapGrid,
  toReportHeatmapRowName
} from '../reportHeatmapGrid'

const key = (value: string) => ({value, label: value, isPartial: false})
const row = (keys: string[], value: number) => ({
  keys: keys.map(key),
  values: [value],
  previousValues: null
})

test('rows split twice sit under a label for each value of the first, and only they get cells', () => {
  const {rows} = toReportHeatmapGrid(
    ['TEAM_LEVEL', 'TEAM', 'CATEGORY'],
    null,
    [
      row(['Platform', 'Core Infra', 'Safety'], 4),
      row(['Platform', 'Data', 'Safety'], 3),
      row(['Custody', 'Custody Ops', 'Safety'], 2)
    ],
    []
  )
  const groups = groupReportHeatmapRows(rows)
  expect(groups.map(({label, rows}) => [label, rows.map(toReportHeatmapRowName)])).toEqual([
    ['Platform', ['Core Infra', 'Data']],
    ['Custody', ['Custody Ops']]
  ])
})

test('rows split once have no label', () => {
  const {rows} = toReportHeatmapGrid(
    ['TEAM', 'CATEGORY'],
    null,
    [row(['Core Infra', 'Safety'], 4), row(['Data', 'Safety'], 3)],
    []
  )
  const groups = groupReportHeatmapRows(rows)
  expect(groups).toHaveLength(1)
  expect(groups[0]?.label).toBeNull()
  expect(groups[0]?.rows.map(toReportHeatmapRowName)).toEqual(['Core Infra', 'Data'])
})
