export type DiscussionThreadFilterValue = 'all' | 'tasks'

interface Props {
  allCount: number
  taskCount: number
  value: DiscussionThreadFilterValue
  onChange: (value: DiscussionThreadFilterValue) => void
}

const pillClass =
  'inline-flex h-7 items-center rounded-full border border-hairline-strong px-2.5 font-semibold text-fg-secondary text-xs leading-4 not-aria-pressed:hover:bg-surface-hover aria-pressed:border-surface-selected aria-pressed:bg-surface-selected aria-pressed:text-fg-selected'

const DiscussionThreadFilter = (props: Props) => {
  const {allCount, taskCount, value, onChange} = props
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
      <button
        type='button'
        aria-pressed={value === 'tasks'}
        aria-label={`Tasks: ${taskCount}`}
        onClick={() => onChange('tasks')}
        className={pillClass}
      >
        Tasks · {taskCount}
      </button>
    </div>
  )
}

export default DiscussionThreadFilter
