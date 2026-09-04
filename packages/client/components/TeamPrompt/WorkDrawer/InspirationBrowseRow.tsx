import type {Ref} from 'react'
import {KeyboardArrowRight, TaskAlt} from '~/ui/icons'
import {browseLabel, browseSubline} from './inspirationCopy'
import type {WorkDrawerDateRange} from './WorkDrawerDateFilter'

interface Props {
  workItemCount?: number
  dateRange?: WorkDrawerDateRange
  buttonRef?: Ref<HTMLButtonElement>
  onClick: () => void
}

const InspirationBrowseRow = (props: Props) => {
  const {workItemCount, dateRange, buttonRef, onClick} = props
  return (
    <div className='mt-1.5 border-hairline border-t pt-2.5'>
      <button
        ref={buttonRef}
        type='button'
        onClick={onClick}
        className='flex h-10 w-full items-center justify-between rounded-md px-2 font-semibold text-[13px] text-fg-secondary hover:bg-surface-hover'
      >
        <span className='flex items-center gap-2'>
          <TaskAlt className='h-[18px] w-[18px]' />
          {browseLabel(workItemCount)}
        </span>
        <KeyboardArrowRight className='h-5 w-5' />
      </button>
      <div className='px-2 text-[11px] text-fg-muted'>{browseSubline(dateRange)}</div>
    </div>
  )
}

export default InspirationBrowseRow
