import {cn} from '../../../ui/cn'

interface Props {
  question: string
  categoryName: string
  categoryDotColor: string
  isChanged: boolean
}

const TeamHealthMeetingPreviewQuestion = (props: Props) => {
  const {question, categoryName, categoryDotColor, isChanged} = props
  return (
    <li
      className={cn(
        'flex gap-2.5 rounded-md border px-3 py-2 transition-colors duration-1000',
        isChanged ? 'border-accent bg-accent/15' : 'border-hairline bg-surface-card'
      )}
    >
      <span className={cn('mt-1.5 size-2.5 shrink-0 rounded-full', categoryDotColor)} />
      <div className='min-w-0 grow'>
        <div className='flex items-center justify-between gap-2 font-semibold text-fg-secondary text-xs'>
          {categoryName}
          {isChanged && (
            <span className='rounded border border-accent px-1 text-fg-primary'>Updated</span>
          )}
        </div>
        <div className='text-fg-primary text-sm'>{question}</div>
      </div>
    </li>
  )
}

export default TeamHealthMeetingPreviewQuestion
