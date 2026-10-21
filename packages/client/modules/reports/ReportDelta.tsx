import {ArrowDownward, ArrowUpward} from '~/ui/icons'
import {REPORT_LOWER_IS_BETTER, type ReportMeasure} from '../../shared/reports/reportCatalog'
import {cn} from '../../ui/cn'
import {formatReportChange} from './formatReportValue'

interface Props {
  change: number
  measure?: ReportMeasure
  comparison?: string
  className?: string
}

const ReportDelta = ({change, measure, comparison, className}: Props) => {
  if (change === 0) {
    return (
      <span className={cn('text-fg-muted text-xs', className)}>
        No change{comparison && ` ${comparison}`}
      </span>
    )
  }
  const isUp = change > 0
  const isBetter = measure && REPORT_LOWER_IS_BETTER.includes(measure) ? !isUp : isUp
  const Arrow = isUp ? ArrowUpward : ArrowDownward
  const changeClassName = isBetter
    ? 'text-jade-700 dark:text-jade-300'
    : 'text-tomato-700 dark:text-tomato-300'
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-fg-muted text-xs', className)}>
      <Arrow className={cn('text-[14px]', changeClassName)} />
      <span className='sr-only'>{isUp ? 'Up' : 'Down'}</span>
      <strong className={cn('font-semibold', changeClassName)}>
        {measure ? formatReportChange(measure, change) : Math.abs(change).toLocaleString()}
      </strong>
      {comparison && <span>&nbsp;{comparison}</span>}
    </span>
  )
}

export default ReportDelta
