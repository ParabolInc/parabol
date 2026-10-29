import {ArrowDownward, ArrowUpward, KeyboardDoubleArrowDown} from '~/ui/icons'
import {cn} from '../../ui/cn'
import plural from '../../utils/plural'
import ReportLegendDisclosure from './ReportLegendDisclosure'
import ReportTeamHealthMark from './ReportTeamHealthMark'
import ReportTeamHealthMarksInfo from './ReportTeamHealthMarksInfo'
import {HEALTH_SCORE_SHADES} from './reportHeatmapShades'
import {TEAM_HEALTH_MARK_NAMES} from './reportTeamHealthWords'

interface Props {
  comparison: string | null
  isPreviousCheck: boolean
  // rows with no check in the period, which the table leaves out
  emptyNames: string[]
  isTeamRows: boolean
}

const MARK_KEYS = ['LOW', 'MEDIUM', 'HIGH', 'BRIGHT_SPOT'] as const

const ReportTeamHealthLegend = (props: Props) => {
  const {comparison, isPreviousCheck, emptyNames, isTeamRows} = props
  const emptyCount = emptyNames.length
  return (
    <div className='flex flex-col gap-2 text-fg-secondary text-xs'>
      {emptyCount > 0 && (
        <p className='m-0'>
          <span className='font-semibold text-fg-primary'>
            {isTeamRows
              ? `No check for ${emptyCount} ${plural(emptyCount, 'team')}:`
              : 'No checks in:'}
          </span>{' '}
          {emptyNames.join(', ')}
        </p>
      )}
      <ReportLegendDisclosure>
        <div className='flex flex-wrap items-center gap-x-5 gap-y-2'>
          <span className='inline-flex flex-wrap items-center gap-x-3 gap-y-1.5'>
            <span>Shaded by the answer each average rounds to:</span>
            {HEALTH_SCORE_SHADES.map(({label, className}) => (
              <span key={label} className='inline-flex items-center gap-1.5'>
                <span
                  className={cn('size-3.5 rounded-xs ring-1 ring-hairline ring-inset', className)}
                />
                {label}
              </span>
            ))}
          </span>
          {comparison && (
            <span className='inline-flex items-center gap-1'>
              <ArrowUpward className='text-[14px]' />
              <ArrowDownward className='-ml-1.5 text-[14px]' />
              Change {comparison}
              {!isPreviousCheck && ', looking back at least 90 days for each team’s check'}
            </span>
          )}
          {isPreviousCheck && (
            <span className='inline-flex items-center gap-1'>
              <KeyboardDoubleArrowDown className='text-[14px] text-tomato-700 dark:text-tomato-300' />
              Fell for a second check in a row
            </span>
          )}
          <span className='inline-flex flex-wrap items-center gap-x-3 gap-y-1.5'>
            <span>Attention:</span>
            {MARK_KEYS.map((mark) => (
              <span key={mark} className='inline-flex items-center gap-1'>
                <ReportTeamHealthMark mark={mark} className='size-4' />
                {TEAM_HEALTH_MARK_NAMES[mark]}
              </span>
            ))}
            <ReportTeamHealthMarksInfo />
          </span>
        </div>
      </ReportLegendDisclosure>
    </div>
  )
}

export default ReportTeamHealthLegend
