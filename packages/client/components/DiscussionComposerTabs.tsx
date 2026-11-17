import type {KeyboardEvent} from 'react'
import Check from '../ui/icons/Check'

export type DiscussionComposerTab = 'comment' | 'task'

interface Props {
  activeTab: DiscussionComposerTab
  isTaskDisabled: boolean
  onChange: (tab: DiscussionComposerTab) => void
}

const tabClass =
  '-mb-px inline-flex h-9 items-center gap-1 border-transparent border-b-2 font-semibold text-[13px] text-fg-secondary leading-4 hover:text-fg-primary disabled:pointer-events-none disabled:opacity-50 aria-selected:border-accent-active aria-selected:text-fg-primary'

const DiscussionComposerTabs = (props: Props) => {
  const {activeTab, isTaskDisabled, onChange} = props
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const focusedTab = (e.target as HTMLElement).dataset.tab
    const nextTab = focusedTab === 'comment' && !isTaskDisabled ? 'task' : 'comment'
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-tab="${nextTab}"]`)?.focus()
  }
  return (
    <div
      role='tablist'
      aria-label='Add to this discussion'
      onKeyDown={onKeyDown}
      className='flex gap-6 border-hairline border-b px-3'
    >
      <button
        type='button'
        role='tab'
        data-tab='comment'
        aria-selected={activeTab === 'comment'}
        tabIndex={activeTab === 'comment' ? 0 : -1}
        onClick={() => onChange('comment')}
        className={tabClass}
      >
        Comment
      </button>
      <button
        type='button'
        role='tab'
        data-tab='task'
        aria-selected={activeTab === 'task'}
        tabIndex={activeTab === 'task' ? 0 : -1}
        disabled={isTaskDisabled}
        onClick={() => onChange('task')}
        className={tabClass}
      >
        <Check className='h-4 w-4' />
        Task
      </button>
    </div>
  )
}

export default DiscussionComposerTabs
