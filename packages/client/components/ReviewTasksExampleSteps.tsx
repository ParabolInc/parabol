import {cn} from '../ui/cn'
import {Check} from '../ui/icons'

interface Props {
  isOwnerPicked: boolean
  isSent: boolean
}

const ReviewTasksExampleSteps = (props: Props) => {
  const {isOwnerPicked, isSent} = props
  const steps = [
    {label: 'Hand it to who’ll do it', isDone: isOwnerPicked},
    {label: 'Send it to your backlog', isDone: isSent},
    {label: 'Next retro, review progress here', isDone: false}
  ]
  return (
    <ol className='mt-7 flex sidebar-left:flex-row flex-col items-start sidebar-left:items-center gap-2 sidebar-left:gap-6'>
      {steps.map(({label, isDone}, idx) => (
        <li
          key={label}
          className={cn(
            'flex items-center gap-2 text-[13px] leading-[18px]',
            isDone ? 'text-fg-primary' : 'text-fg-secondary'
          )}
        >
          <span
            className={cn(
              'flex h-5 w-5 flex-none items-center justify-center rounded-full font-semibold text-xs',
              isDone
                ? 'bg-accent-active text-white dark:text-grape-950'
                : 'bg-surface-well text-fg-secondary'
            )}
          >
            {isDone ? <Check className='h-3.5 w-3.5' aria-label='Done' /> : idx + 1}
          </span>
          {label}
        </li>
      ))}
    </ol>
  )
}

export default ReviewTasksExampleSteps
