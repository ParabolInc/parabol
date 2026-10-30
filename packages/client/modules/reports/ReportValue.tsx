import type {ReportMeasure} from '../../shared/reports/reportCatalog'
import {MIN_RESPONDENTS_FOR_SCORE} from '../../shared/utils/teamHealthAnonymity'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'
import {formatReportValue} from './formatReportValue'
import {isHiddenReportValue} from './reportRows'

interface Props {
  measure: ReportMeasure
  value: number | null | undefined
}

const HIDDEN_EXPLANATION = `Hidden for anonymity: fewer than ${MIN_RESPONDENTS_FOR_SCORE} people answered`

const ReportValue = ({measure, value}: Props) => {
  if (!isHiddenReportValue(value)) return <>{formatReportValue(measure, value)}</>
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} aria-label={HIDDEN_EXPLANATION} className='cursor-help'>
          ?
        </span>
      </TooltipTrigger>
      <TooltipContent className='max-w-64 whitespace-normal'>{HIDDEN_EXPLANATION}</TooltipContent>
    </Tooltip>
  )
}

export default ReportValue
