import type {ReportSpec} from '../../shared/reports/reportCatalog'
import {cn} from '../../ui/cn'
import formatComparison from './formatComparison'
import {formatReportValue} from './formatReportValue'
import ReportDelta from './ReportDelta'
import type {ReportResultRow} from './reportRows'

interface Props {
  spec: ReportSpec
  rows: readonly ReportResultRow[]
  isCompact: boolean
}

const ReportNumberView = ({spec, rows, isCompact}: Props) => {
  const measure = spec.measures[0]!
  const value = rows[0]?.values[0] ?? null
  const previousValue = rows[0]?.previousValues?.[0] ?? null
  return (
    <div className='flex flex-col gap-1'>
      <span className={cn('font-bold tabular-nums', isCompact ? 'text-3xl' : 'text-5xl')}>
        {formatReportValue(measure, value)}
      </span>
      {spec.compareTo && value !== null && previousValue !== null && (
        <ReportDelta
          change={value - previousValue}
          measure={measure}
          comparison={formatComparison(spec.compareTo)}
          className={isCompact ? undefined : 'text-sm'}
        />
      )}
    </div>
  )
}

export default ReportNumberView
