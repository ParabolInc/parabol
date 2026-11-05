import {ArrowDownward, ArrowUpward, KeyboardDoubleArrowDown} from '~/ui/icons'
import type {TeamHealthMark} from '../../shared/reports/teamHealthAttention'
import {cn} from '../../ui/cn'
import {formatReportChange, formatReportValue} from './formatReportValue'
import ReportTeamHealthMark from './ReportTeamHealthMark'

interface Props {
  value: number | null
  isHidden: boolean
  change: number | null
  mark: TeamHealthMark | null
  isFellTwice: boolean
  isTotal: boolean
}

// On a narrow table the mark sits by the score and the change goes below; on a wide one they share a line
const ReportTeamHealthCellContent = (props: Props) => {
  const {value, isHidden, change, mark, isFellTwice, isTotal} = props
  const ChangeIcon =
    !change || change > 0 ? ArrowUpward : isFellTwice ? KeyboardDoubleArrowDown : ArrowDownward
  return (
    <>
      <span className='flex @3xl:contents items-center gap-1'>
        <span
          className={cn(
            '@3xl:flex-none flex-1 @3xl:text-[15px] text-sm leading-[18px]',
            isTotal ? 'font-bold' : 'font-semibold'
          )}
        >
          {isHidden ? '?' : value === null ? '' : formatReportValue('HEALTH_SCORE', value)}
        </span>
        {mark && (
          <span className='@3xl:order-last @3xl:ml-auto inline-flex rounded-full ring-2 ring-surface-card'>
            <ReportTeamHealthMark mark={mark} className='@3xl:size-[18px] size-4' />
          </span>
        )}
      </span>
      {change !== null && change !== 0 && (
        <span
          className={cn(
            'inline-flex items-center font-semibold @3xl:text-xs text-[11px] leading-[14px]',
            change > 0 ? 'text-jade-700 dark:text-jade-300' : 'text-tomato-700 dark:text-tomato-300'
          )}
        >
          <ChangeIcon className='@3xl:text-[14px] text-[12px]' />
          {formatReportChange('HEALTH_SCORE', change)}
        </span>
      )}
    </>
  )
}

export default ReportTeamHealthCellContent
