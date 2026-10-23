import {ArrowDownward, ArrowUpward, KeyboardDoubleArrowDown} from '~/ui/icons'
import {cn} from '../../ui/cn'
import {formatReportChange, formatReportValue} from './formatReportValue'
import ReportTeamHealthSparkline from './ReportTeamHealthSparkline'
import {formatCheckDate} from './reportTeamHealthWords'

interface Props {
  scoreHistory: readonly {readonly endedAt: string; readonly score: number}[]
  teamName: string
  categoryName: string
}

const ReportTeamHealthTrend = ({scoreHistory, teamName, categoryName}: Props) => {
  const [latest, previous, beforeThat] = [...scoreHistory].reverse()
  if (!latest) return null
  const change = previous ? Math.round((latest.score - previous.score) * 10) / 10 : 0
  const isUp = change > 0
  const hasFallenTwice = change < 0 && !!beforeThat && previous!.score < beforeThat.score
  const ChangeIcon = isUp ? ArrowUpward : hasFallenTwice ? KeyboardDoubleArrowDown : ArrowDownward
  const changeClassName = isUp
    ? 'text-jade-700 dark:text-jade-300'
    : 'text-tomato-700 dark:text-tomato-300'
  const points = scoreHistory
    .map(
      ({endedAt, score}) =>
        `${formatReportValue('HEALTH_SCORE', score)} on ${formatCheckDate(endedAt)}`
    )
    .join(', ')
  return (
    <div className='flex items-center gap-4'>
      <div className='flex flex-col gap-0.5'>
        <div className='flex items-baseline gap-1.5'>
          <span className='font-bold text-[32px] leading-9'>
            {formatReportValue('HEALTH_SCORE', latest.score)}
          </span>
          <span className='text-fg-muted text-sm'>/ 5</span>
        </div>
        <span className='inline-flex items-center gap-0.5 whitespace-nowrap text-[13px] text-fg-secondary'>
          {!previous ? (
            'The team’s first scored check'
          ) : change === 0 ? (
            `No change since ${formatCheckDate(previous.endedAt)}`
          ) : (
            <>
              <ChangeIcon className={cn('text-[16px]', changeClassName)} />
              <strong className={cn('font-semibold', changeClassName)}>
                {formatReportChange('HEALTH_SCORE', change)}
              </strong>
              &nbsp;since {formatCheckDate(previous.endedAt)}
            </>
          )}
        </span>
      </div>
      {scoreHistory.length > 1 && (
        <ReportTeamHealthSparkline
          scoreHistory={scoreHistory}
          label={`${categoryName} over ${teamName}’s last ${scoreHistory.length} checks: ${points}`}
        />
      )}
    </div>
  )
}

export default ReportTeamHealthTrend
