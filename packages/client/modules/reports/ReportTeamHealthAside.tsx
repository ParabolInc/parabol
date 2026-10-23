import {type ReactNode, useId} from 'react'
import {Close} from '~/ui/icons'
import type {ReportTeamHealthSelection} from './reportTeamHealthCells'

interface Props {
  selection: ReportTeamHealthSelection
  meta: string
  onClose: () => void
  children: ReactNode
}

const ReportTeamHealthAside = ({selection, meta, onClose, children}: Props) => {
  const headingId = useId()
  return (
    <aside
      aria-labelledby={headingId}
      className='sticky top-4 flex max-h-[calc(100dvh-6rem)] w-[360px] shrink-0 flex-col gap-3.5 overflow-y-auto border-hairline border-l pl-5'
    >
      <div className='flex items-start gap-2'>
        <div className='min-w-0 flex-1'>
          <span className='block font-semibold text-[13px] text-fg-secondary'>
            {selection.teamName}
          </span>
          <h2 id={headingId} className='m-0 font-semibold text-lg leading-6'>
            {selection.categoryName}
          </h2>
          <span className='mt-0.5 block text-[13px] text-fg-muted'>{meta}</span>
        </div>
        <button
          type='button'
          aria-label='Close details'
          onClick={onClose}
          className='-mt-1.5 -mr-2 flex size-9 shrink-0 items-center justify-center rounded-md text-fg-secondary hover:bg-surface-hover'
        >
          <Close className='text-[20px]' />
        </button>
      </div>
      {children}
    </aside>
  )
}

export default ReportTeamHealthAside
