import type {ReactNode} from 'react'
import {cn} from '../../../ui/cn'

interface Props {
  className?: string
  children: ReactNode
}

export const SyncedBlockTag = ({className, children}: Props) => (
  <span
    className={cn(
      'inline-flex h-4 shrink-0 items-center rounded-sm bg-[color-mix(in_srgb,currentColor_18%,transparent)] px-[5px] pb-px font-semibold text-xs leading-[14px] tracking-[.06em] [font-variant-caps:all-small-caps]',
      className
    )}
  >
    {children}
  </span>
)
