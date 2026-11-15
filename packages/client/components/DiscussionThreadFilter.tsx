import {cn} from '../ui/cn'
import Warning from '../ui/icons/Warning'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'

export type DiscussionThreadFilterValue = 'all' | 'tasks'

interface Props {
  allCount: number
  taskCount: number
  peopleCommentCount: number | null
  value: DiscussionThreadFilterValue
  onChange: (value: DiscussionThreadFilterValue) => void
}

const pillClass =
  'inline-flex h-7 items-center gap-1 rounded-full border border-hairline-strong px-2.5 font-semibold text-fg-secondary text-xs leading-4 not-aria-pressed:hover:bg-surface-hover aria-pressed:border-surface-selected aria-pressed:bg-surface-selected aria-pressed:text-fg-selected'

const goldClass =
  'border-gold-300 bg-gold-100 text-gold-700 not-aria-pressed:hover:bg-gold-100 dark:border-gold-500/45 dark:bg-gold-500/20 dark:text-gold-200 dark:not-aria-pressed:hover:bg-gold-500/20'

const DiscussionThreadFilter = (props: Props) => {
  const {allCount, taskCount, peopleCommentCount, value, onChange} = props
  const isGold = peopleCommentCount !== null && value !== 'tasks'
  const tasksPill = (
    <button
      type='button'
      aria-pressed={value === 'tasks'}
      aria-label={
        isGold ? `Tasks: none yet, after ${peopleCommentCount} comments` : `Tasks: ${taskCount}`
      }
      onClick={() => onChange('tasks')}
      className={cn(pillClass, isGold && goldClass)}
    >
      {isGold && <Warning className='h-3.5 w-3.5' />}
      Tasks · {taskCount}
    </button>
  )
  return (
    <div
      role='group'
      aria-label='Show in this discussion'
      className='flex shrink-0 items-center gap-2 border-hairline border-b px-4 py-2'
    >
      <button
        type='button'
        aria-pressed={value === 'all'}
        onClick={() => onChange('all')}
        className={pillClass}
      >
        All · {allCount}
      </button>
      {isGold ? (
        <Tooltip>
          <TooltipTrigger asChild>{tasksPill}</TooltipTrigger>
          <TooltipContent side='bottom' align='start'>
            People have been talking here, and there’s no task yet
          </TooltipContent>
        </Tooltip>
      ) : (
        tasksPill
      )}
    </div>
  )
}

export default DiscussionThreadFilter
