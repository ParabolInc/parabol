import type {TeamHealthAttentionInput} from '../../shared/reports/teamHealthAttention'
import {cn} from '../../ui/cn'
import type {ReportTeamHealthCell} from './reportTeamHealthCells'
import {describeSentiment, describeSpread} from './reportTeamHealthWords'

interface Props {
  input: TeamHealthAttentionInput
  category: ReportTeamHealthCell['category']
  isBrightSpot: boolean
}

const LABELS: Record<TeamHealthAttentionInput['key'], string> = {
  sentiment: 'Summary sentiment',
  spread: 'Answer spread',
  commented: 'People who commented'
}
const WEIGHTS: Record<TeamHealthAttentionInput['key'], string> = {
  sentiment: '½',
  spread: '¼',
  commented: '¼'
}

const ReportTeamHealthDriver = ({input, category, isBrightSpot}: Props) => {
  const {key, value} = input
  const {sentimentScore, isLoadingSummary, commenterCount, respondentCount} = category
  const isMissing = value === null
  const isBrightReason = isBrightSpot && key === 'sentiment'
  const weight = isMissing
    ? 'not used'
    : isBrightSpot
      ? isBrightReason
        ? 'the reason'
        : 'for context'
      : WEIGHTS[key]
  const reading =
    key === 'sentiment'
      ? sentimentScore == null
        ? isLoadingSummary
          ? 'Being written'
          : 'No summary'
        : describeSentiment(sentimentScore)
      : key === 'spread'
        ? value === null
          ? 'Needs 4 answers'
          : describeSpread(value)
        : `${commenterCount} of ${respondentCount}`
  const share = isBrightReason ? (sentimentScore ?? 0) : (value ?? 0)
  return (
    <div className='flex flex-col gap-1'>
      <span className='flex justify-between gap-2 text-[13px] leading-4'>
        <span className='text-fg-secondary'>
          {LABELS[key]} <span className='text-fg-muted'>· {weight}</span>
        </span>
        <strong className={cn('whitespace-nowrap font-semibold', isMissing && 'text-fg-muted')}>
          {reading}
        </strong>
      </span>
      <span
        aria-hidden='true'
        className={cn(
          'flex h-1.5 rounded-full',
          isMissing
            ? 'bg-[repeating-linear-gradient(90deg,var(--color-hairline-strong)_0_6px,transparent_6px_10px)]'
            : 'bg-hairline-strong',
          isMissing && isLoadingSummary && key === 'sentiment' && 'animate-pulse'
        )}
      >
        <span
          className={cn(
            'rounded-full',
            isBrightReason ? 'bg-jade-600 dark:bg-jade-300' : 'bg-fg-secondary'
          )}
          style={{width: `${share * 100}%`}}
        />
      </span>
    </div>
  )
}

export default ReportTeamHealthDriver
