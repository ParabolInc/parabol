import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
  type TooltipItem
} from 'chart.js'
import {Bar} from 'react-chartjs-2'
import useResolvedTheme from '../../hooks/useResolvedTheme'
import {
  isReportAdditiveMeasure,
  isReportTimeDimension,
  REPORT_MEASURES,
  type ReportSpec
} from '../../shared/reports/reportCatalog'
import {formatReportKey, PARTIAL_STEP_NOTE} from './formatReportKey'
import {formatReportValue} from './formatReportValue'
import ReportLegend from './ReportLegend'
import {getReportChartFont, getReportChartTheme, PARTIAL_STEP_ALPHA} from './reportChartTheme'
import {distinctKeysAt, type ReportResultRow, withValues} from './reportRows'
import {
  getReportSeriesColor,
  REPORT_NONE_COLOR,
  REPORT_SINGLE_SERIES_COLOR
} from './reportSeriesColors'
import {REPORT_COMPARE_LABELS, type ReportStepLength} from './reportSpecLabels'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

interface Props {
  spec: ReportSpec
  step: ReportStepLength | null | undefined
  rows: readonly ReportResultRow[]
  isCompact: boolean
}

const BAR_HEIGHT = 28

const ReportBarsView = ({spec, step, rows, isCompact}: Props) => {
  const theme = useResolvedTheme()
  const chartTheme = getReportChartTheme(theme)
  const font = getReportChartFont()
  const measure = spec.measures[0]!
  const [barDimension, stackDimension] = spec.breakdown.map(({dimension}) => dimension)
  const bars = distinctKeysAt(rows, 0)
  const isOverTime = isReportTimeDimension(barDimension!)
  const emptyValue = isReportAdditiveMeasure(measure) ? 0 : null
  const {kind, label: measureLabel} = REPORT_MEASURES[measure]
  const isShare = kind === 'share'
  const isScore = kind === 'score'
  const valueByKeys = new Map(
    rows.map(({keys, values}) => [keys.map(({value}) => value).join('|'), values[0] ?? emptyValue])
  )
  const series = stackDimension
    ? withValues(distinctKeysAt(rows, 1), rows).map((key, rank) => ({
        key,
        label: key.label,
        color: getReportSeriesColor(stackDimension, key.value, rank)
      }))
    : [{key: null, label: measureLabel, color: REPORT_SINGLE_SERIES_COLOR}]
  const previousByBar = new Map(
    rows.map(({keys, previousValues}) => [keys[0]?.value, previousValues?.[0] ?? emptyValue])
  )
  // a comparison sits beside each bar, so it can't share a chart with stacks
  const comparison =
    spec.compareTo && !stackDimension
      ? {
          label: REPORT_COMPARE_LABELS[spec.compareTo],
          data: bars.map((bar) => previousByBar.get(bar.value) ?? emptyValue),
          backgroundColor: REPORT_NONE_COLOR[theme],
          maxBarThickness: 48
        }
      : null
  const datasets = series.map(({key, label, color}) => {
    const hex = color[theme]
    return {
      label,
      data: bars.map(
        (bar) => valueByKeys.get(key ? `${bar.value}|${key.value}` : bar.value) ?? emptyValue
      ),
      backgroundColor: bars.map((bar) => (bar.isPartial ? `${hex}${PARTIAL_STEP_ALPHA}` : hex)),
      maxBarThickness: 48
    }
  })
  const valueAxis = {
    stacked: !comparison,
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
  const categoryAxis = {
    stacked: !comparison,
    grid: {display: false},
    border: {color: chartTheme.grid},
    ticks: {color: chartTheme.tick, font, maxRotation: 0, autoSkipPadding: 12}
  }
  const chartHeight = isOverTime
    ? isCompact
      ? 160
      : 320
    : Math.max(isCompact ? 120 : 160, bars.length * BAR_HEIGHT + 40)
  return (
    <div className='flex flex-col gap-3'>
      {stackDimension && <ReportLegend measure={measure} series={series} rows={rows} />}
      {comparison && (
        <ReportLegend
          measure={measure}
          series={[...series, {key: null, label: comparison.label, color: REPORT_NONE_COLOR}]}
          rows={rows}
        />
      )}
      <div style={{height: chartHeight}}>
        <Bar
          data={{
            labels: bars.map((bar) => formatReportKey(bar, barDimension!, step)),
            datasets: comparison ? [...datasets, comparison] : datasets
          }}
          options={{
            indexAxis: isOverTime ? 'x' : 'y',
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
                  title: (items: TooltipItem<'bar'>[]) => {
                    const bar = bars[items[0]!.dataIndex]!
                    const name = formatReportKey(bar, barDimension!, step, true)
                    return bar.isPartial ? `${name}, ${PARTIAL_STEP_NOTE.toLowerCase()}` : name
                  },
                  label: (item: TooltipItem<'bar'>) =>
                    `${item.dataset.label}: ${formatReportValue(measure, isOverTime ? item.parsed.y : item.parsed.x)}`
                }
              }
            },
            scales: isOverTime ? {x: categoryAxis, y: valueAxis} : {x: valueAxis, y: categoryAxis}
          }}
        />
      </div>
    </div>
  )
}

export default ReportBarsView
