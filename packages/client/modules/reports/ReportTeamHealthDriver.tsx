import type {TeamHealthAttentionInput} from '../../shared/reports/teamHealthAttention'
import {MIN_RESPONDENTS_FOR_DETAILS} from '../../shared/utils/teamHealthAnonymity'
import {cn} from '../../ui/cn'
import type {ReportTeamHealthCell} from './reportTeamHealthCells'
import {describeSentiment, describeSpread} from './reportTeamHealthWords'

interface Props {
  input: TeamHealthAttentionInput
  stage: ReportTeamHealthCell['stage']
  isBrightSpot: boolean
}

const LABELS: Record<TeamHealthAttentionInput['key'], string> = {
  sentiment: 'Summary tone',
  spread: 'Answer spread',
  commented: 'People who commented'
}

const describeInput = (
  {key, value}: TeamHealthAttentionInput,
  {sentimentScore, isLoadingSummary, commentCount, respondentCount}: Props['stage']
) => {
  if (key === 'sentiment') {
    if (sentimentScore != null) return describeSentiment(sentimentScore)
    return isLoadingSummary ? 'Being written' : 'No summary'
  }
  if (key === 'spread') {
    return value === null ? `Needs ${MIN_RESPONDENTS_FOR_DETAILS} answers` : describeSpread(value)
  }
  return `${commentCount} of ${respondentCount ?? 0}`
}

// The bar is how far the input pushes the cell toward attention, or for a bright spot how positive the summary is
const ReportTeamHealthDriver = ({input, stage, isBrightSpot}: Props) => {
  const {key, value} = input
  const isMissing = value === null
  const share = isBrightSpot ? (stage.sentimentScore ?? 0) : (value ?? 0)
  return (
    <div className='flex flex-col gap-1'>
      <span className='flex justify-between gap-2 text-[13px] leading-4'>
        <span className='text-fg-secondary'>{LABELS[key]}</span>
        <strong className={cn('whitespace-nowrap font-semibold', isMissing && 'text-fg-muted')}>
          {describeInput(input, stage)}
        </strong>
      </span>
      <span
        aria-hidden='true'
        className={cn(
          'flex h-1.5 rounded-full',
          isMissing
            ? 'bg-[repeating-linear-gradient(90deg,var(--color-hairline-strong)_0_6px,transparent_6px_10px)]'
            : 'bg-hairline-strong',
          isMissing && stage.isLoadingSummary && key === 'sentiment' && 'animate-pulse'
        )}
      >
        <span
          className={cn(
            'rounded-full',
            isBrightSpot ? 'bg-jade-600 dark:bg-jade-300' : 'bg-fg-secondary'
          )}
          style={{width: `${share * 100}%`}}
        />
      </span>
    </div>
  )
}

export default ReportTeamHealthDriver
