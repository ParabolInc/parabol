import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  type ScriptableLineSegmentContext,
  Tooltip,
  type TooltipItem
} from 'chart.js'
import {Line} from 'react-chartjs-2'
import useResolvedTheme from '../../hooks/useResolvedTheme'
import {REPORT_MEASURES, type ReportSpec} from '../../shared/reports/reportCatalog'
import {formatReportKey, PARTIAL_STEP_NOTE} from './formatReportKey'
import {formatReportValue} from './formatReportValue'
import ReportLegend from './ReportLegend'
import {getReportChartFont, getReportChartTheme} from './reportChartTheme'
import {distinctKeysAt, type ReportResultRow, withValues} from './reportRows'
import {getReportSeriesColor, REPORT_SINGLE_SERIES_COLOR} from './reportSeriesColors'
import {REPORT_COMPARE_LABELS, type ReportStepLength} from './reportSpecLabels'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Filler)

interface Props {
  spec: ReportSpec
  step: ReportStepLength | null | undefined
  rows: readonly ReportResultRow[]
  isCompact: boolean
}

// lines differ in point shape as well as color
const POINT_STYLES = ['circle', 'rect', 'triangle', 'rectRot', 'star', 'crossRot'] as const
const COMPARISON_COLOR = {light: '#82809A', dark: '#A7A3C2'}

const ReportLineView = ({spec, step, rows, isCompact}: Props) => {
  const theme = useResolvedTheme()
  const chartTheme = getReportChartTheme(theme)
  const font = getReportChartFont()
  const measure = spec.measures[0]!
  const {kind} = REPORT_MEASURES[measure]
  const isShare = kind === 'share'
  const isScore = kind === 'score'
  const [overDimension, lineDimension] = spec.breakdown.map(({dimension}) => dimension)
  const steps = distinctKeysAt(rows, 0)
  const rowByKeys = new Map(rows.map((row) => [row.keys.map(({value}) => value).join('|'), row]))
  const series = lineDimension
    ? withValues(distinctKeysAt(rows, 1), rows).map((key, rank) => ({
        key,
        label: key.label,
        color: getReportSeriesColor(lineDimension, key.value, rank)
      }))
    : [{key: null, label: REPORT_MEASURES[measure].label, color: REPORT_SINGLE_SERIES_COLOR}]
  const isPartialAt = (idx: number) => steps[idx]?.isPartial ?? false
  // a line into or out of a step the period cuts short is dashed, so the dip doesn't read as a drop
  const partialDash = (ctx: ScriptableLineSegmentContext) =>
    isPartialAt(ctx.p0DataIndex) || isPartialAt(ctx.p1DataIndex) ? [3, 4] : undefined
  const datasets = series.map(({key, label, color}, rank) => {
    const hex = color[theme]
    return {
      label,
      data: steps.map(
        (stepKey) =>
          rowByKeys.get(key ? `${stepKey.value}|${key.value}` : stepKey.value)?.values[0] ?? null
      ),
      borderColor: hex,
      backgroundColor: `${hex}1A`,
      fill: series.length === 1 ? 'origin' : false,
      borderWidth: 2,
      pointStyle: POINT_STYLES[rank % POINT_STYLES.length],
      pointRadius: isCompact ? 3 : 4,
      pointBorderColor: hex,
      pointBackgroundColor: steps.map((stepKey) => (stepKey.isPartial ? chartTheme.card : hex)),
      segment: {borderDash: partialDash}
    }
  })
  const comparison =
    spec.compareTo && !lineDimension
      ? {
          label: REPORT_COMPARE_LABELS[spec.compareTo],
          data: steps.map((stepKey) => rowByKeys.get(stepKey.value)?.previousValues?.[0] ?? null),
          borderColor: COMPARISON_COLOR[theme],
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 0
        }
      : null
  return (
    <div className='flex flex-col gap-3'>
      {lineDimension && <ReportLegend measure={measure} series={series} rows={rows} />}
      <div className={isCompact ? 'h-40' : 'h-80'}>
        <Line
          data={{
            labels: steps.map((stepKey) => formatReportKey(stepKey, overDimension!, step)),
            datasets: comparison ? [...datasets, comparison] : datasets
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
              legend: {display: false},
              tooltip: {
                backgroundColor: chartTheme.tooltip,
                titleColor: chartTheme.tooltipText,
                bodyColor: chartTheme.tooltipText,
                titleFont: font,
                bodyFont: font,
                callbacks: {
                  title: (items: TooltipItem<'line'>[]) => {
                    const stepKey = steps[items[0]!.dataIndex]!
                    const name = formatReportKey(stepKey, overDimension!, step, true)
                    return stepKey.isPartial ? `${name}, ${PARTIAL_STEP_NOTE.toLowerCase()}` : name
                  },
                  label: (item: TooltipItem<'line'>) =>
                    `${item.dataset.label}: ${formatReportValue(measure, item.parsed.y)}`
                }
              }
            },
            scales: {
              x: {
                grid: {display: false},
                border: {color: chartTheme.grid},
                ticks: {color: chartTheme.tick, font, maxRotation: 0, autoSkipPadding: 16}
              },
              y: {
                beginAtZero: !isScore,
                min: isScore ? 1 : undefined,
                max: isScore ? 5 : isShare ? 100 : undefined,
                border: {display: false},
                grid: {color: chartTheme.grid},
                ticks: {
                  color: chartTheme.tick,
                  font,
                  precision: 0,
                  callback: isShare ? (tick: number | string) => `${tick}%` : undefined
                }
              }
            }
          }}
        />
      </div>
    </div>
  )
}

export default ReportLineView
