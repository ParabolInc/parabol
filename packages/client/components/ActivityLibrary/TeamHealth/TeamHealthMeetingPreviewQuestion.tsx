import {cn} from '../../../ui/cn'

interface Props {
  question: string
  categoryName: string
  categoryDotColor: string
}

const TeamHealthMeetingPreviewQuestion = (props: Props) => {
  const {question, categoryName, categoryDotColor} = props
  return (
    <li className='flex gap-2.5 rounded-md border border-hairline bg-surface-card px-3 py-1.5'>
      <span className={cn('mt-1.5 size-2.5 shrink-0 rounded-full', categoryDotColor)} />
      <div className='min-w-0'>
        <div className='font-semibold text-fg-secondary text-xs'>{categoryName}</div>
        <div className='text-fg-primary text-sm'>{question}</div>
      </div>
    </li>
  )
}

export default TeamHealthMeetingPreviewQuestion
