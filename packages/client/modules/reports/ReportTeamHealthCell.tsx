import {MIN_REPORT_HEALTH_RESPONDENTS} from '../../shared/reports/reportCatalog'
import {cn} from '../../ui/cn'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'
import {formatReportChange, formatReportValue} from './formatReportValue'
import ReportTeamHealthCellContent from './ReportTeamHealthCellContent'
import type {ReportHeatmapValue} from './reportHeatmapGrid'
import {healthScoreShadeOf} from './reportHeatmapShades'
import {isHiddenReportValue} from './reportRows'
import type {ReportTeamHealthCell as TeamHealthCell} from './reportTeamHealthCells'
import {describeReasons, TEAM_HEALTH_MARK_NAMES} from './reportTeamHealthWords'

const HIDDEN_EXPLANATION = `Hidden for anonymity: fewer than ${MIN_REPORT_HEALTH_RESPONDENTS} people answered`

interface Props {
  label: string
  value: ReportHeatmapValue | undefined
  cell?: TeamHealthCell
  isFellTwice?: boolean
  isTotal?: boolean
  isSelected?: boolean
  onSelect?: () => void
}

const ReportTeamHealthCell = (props: Props) => {
  const {label, value, cell, isFellTwice = false, isTotal = false, isSelected, onSelect} = props
  const isHidden = isHiddenReportValue(value?.value)
  const score = isHidden ? null : (value?.value ?? null)
  const previous = isHiddenReportValue(value?.previous) ? null : (value?.previous ?? null)
  const change =
    score !== null && previous !== null ? Math.round((score - previous) * 10) / 10 : null
  const mark = cell?.mark ?? null
  const boxClassName = cn(
    'flex @3xl:h-10 @3xl:min-h-0 min-h-11 w-full @3xl:flex-row flex-col @3xl:items-center @3xl:justify-start justify-center @3xl:gap-1.5 gap-px rounded @3xl:px-2 px-1.5 py-0.5 text-left',
    score === null ? 'border border-hairline' : healthScoreShadeOf(score).className
  )
  const content = (
    <ReportTeamHealthCellContent
      value={score}
      isHidden={isHidden}
      change={change}
      mark={mark}
      isFellTwice={isFellTwice}
      isTotal={isTotal}
    />
  )
  if (!onSelect || !cell) {
    return (
      <td className='px-0.5 py-1'>
        <div className={boxClassName} title={isHidden ? HIDDEN_EXPLANATION : undefined}>
          {content}
        </div>
      </td>
    )
  }
  const changeLabel =
    change === null
      ? ''
      : change === 0
        ? ', no change'
        : `, ${change > 0 ? 'up' : 'down'} ${formatReportChange('HEALTH_SCORE', change)}`
  const markLabel = !mark
    ? ''
    : mark === 'BRIGHT_SPOT'
      ? ', bright spot'
      : `, needs attention, ${TEAM_HEALTH_MARK_NAMES[mark].toLowerCase()}`
  const button = (
    <button
      type='button'
      aria-pressed={isSelected}
      aria-label={`${label}: ${formatReportValue('HEALTH_SCORE', score)}${changeLabel}${isFellTwice ? ', fell twice in a row' : ''}${markLabel}`}
      onClick={onSelect}
      className={cn(
        boxClassName,
        'hover:ring-1 hover:ring-hairline-strong',
        isSelected &&
          'ring-2 ring-accent ring-offset-2 ring-offset-surface-card hover:ring-2 hover:ring-accent'
      )}
    >
      {content}
    </button>
  )
  return (
    <td className='px-0.5 py-1'>
      {mark ? (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent
            side='bottom'
            className='flex max-w-60 flex-col gap-0.5 whitespace-normal px-2.5 py-2 text-left font-normal leading-[17px]'
          >
            <strong className='font-semibold'>
              {mark === 'BRIGHT_SPOT'
                ? 'Bright spot'
                : `Needs attention · ${TEAM_HEALTH_MARK_NAMES[mark]}`}
            </strong>
            {mark === 'BRIGHT_SPOT' ? 'Very positive summary' : describeReasons(cell)}
          </TooltipContent>
        </Tooltip>
      ) : (
        button
      )}
    </td>
  )
}

export default ReportTeamHealthCell
