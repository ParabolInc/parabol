import type {ReactNode} from 'react'
import {cn} from '../../../ui/cn'
import type {InspirationVariant} from './InspirationPresentationContext'

export interface WorkDrawerServiceTab {
  icon: ReactNode
  service: string
  label: string
}

interface Props {
  tabs: readonly WorkDrawerServiceTab[]
  activeIdx: number
  variant: InspirationVariant
  onSelect: (idx: number) => void
}

const WorkDrawerServiceTabs = (props: Props) => {
  const {tabs, activeIdx, variant, onSelect} = props
  const isSheet = variant === 'sheet'
  return (
    <div className='flex gap-1'>
      {tabs.map((tab, idx) => (
        <button
          key={tab.label}
          title={tab.label}
          aria-label={tab.label}
          onClick={() => onSelect(idx)}
          className={cn(
            'flex shrink-0 appearance-none items-center justify-center',
            isSheet ? 'h-11 w-11' : 'h-10 w-10',
            idx !== activeIdx && 'cursor-pointer'
          )}
        >
          <span
            className={cn(
              'flex items-center justify-center rounded-md transition-colors',
              isSheet ? 'h-9 w-9' : 'h-10 w-10',
              idx === activeIdx
                ? // the logos are dark brand colors, so they go monochrome on the selected fill
                  'bg-surface-selected text-fg-selected [&_path]:fill-current'
                : 'text-fg-muted hover:bg-surface-hover'
            )}
          >
            {tab.icon}
          </span>
        </button>
      ))}
    </div>
  )
}

export default WorkDrawerServiceTabs
