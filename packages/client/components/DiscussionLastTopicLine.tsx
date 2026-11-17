interface Props {
  onAddTask: () => void
}

const DiscussionLastTopicLine = ({onAddTask}: Props) => (
  <div
    role='status'
    className='mx-3 mb-2 flex min-h-9 items-center justify-between gap-2 rounded-lg border border-hairline bg-surface-well py-1 pr-1 pl-3 text-[13px] text-fg-secondary leading-[18px]'
  >
    <span>No tasks from this retro yet.</span>
    <button
      type='button'
      onClick={onAddTask}
      className='min-h-11 sidebar-left:min-h-7 shrink-0 rounded-sm px-2 font-semibold text-accent-active hover:bg-surface-hover'
    >
      Add a task
    </button>
  </div>
)

export default DiscussionLastTopicLine
