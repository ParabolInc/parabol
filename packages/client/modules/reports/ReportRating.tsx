import {useId} from 'react'
import {SentimentDissatisfied, SentimentSatisfied} from '~/ui/icons'
import type {ReportQuestionRatingEnum} from '../../__generated__/useRateReportQuestionMutation.graphql'
import useRateReportQuestionMutation from '../../mutations/useRateReportQuestionMutation'
import {Button} from '../../ui/Button/Button'
import {cn} from '../../ui/cn'

interface Props {
  orgId: string
  reportQuestionId: string
  rating: ReportQuestionRatingEnum | null | undefined
}

const OPTIONS = [
  {value: 'good', label: 'Yes, it answered my question', Icon: SentimentSatisfied},
  {value: 'bad', label: 'No, it missed', Icon: SentimentDissatisfied}
] as const

const PROMPTS = {
  good: 'Thanks. You said this answered your question',
  bad: 'Thanks. You said this missed. Rewording the question or changing the report above may help'
} as const

// Picking a face again takes the rating back
const ReportRating = ({orgId, reportQuestionId, rating}: Props) => {
  const promptId = useId()
  const [rate] = useRateReportQuestionMutation()
  const prompt = rating === 'good' || rating === 'bad' ? PROMPTS[rating] : null
  return (
    <div className='flex flex-wrap items-center gap-x-3 gap-y-2 border-hairline border-t px-5 py-3'>
      <span id={promptId} className='min-w-0 flex-[1_1_240px] text-fg-secondary text-sm'>
        {prompt ?? 'Did this report answer your question?'}
      </span>
      <div role='group' aria-labelledby={promptId} className='flex gap-2'>
        {OPTIONS.map(({value, label, Icon}) => {
          const isPicked = rating === value
          return (
            <Button
              key={value}
              variant='outline'
              size='md'
              shape='icon'
              aria-label={label}
              aria-pressed={isPicked}
              title={label}
              className={cn('p-0 text-fg-secondary', isPicked && 'border-accent text-accent')}
              onClick={() =>
                rate({variables: {orgId, reportQuestionId, rating: isPicked ? null : value}})
              }
            >
              <Icon className='text-[22px]' />
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export default ReportRating
