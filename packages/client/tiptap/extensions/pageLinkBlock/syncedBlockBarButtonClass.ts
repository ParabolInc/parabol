import {cn} from '../../../ui/cn'

export const syncedBlockBarButtonClass = (isViewOnly: boolean) =>
  cn(
    'h-[22px] gap-1 rounded-sm px-1.5 font-medium',
    isViewOnly ? 'hover:bg-surface-hover' : 'hover:bg-white/18 dark:hover:bg-grape-950/16'
  )
