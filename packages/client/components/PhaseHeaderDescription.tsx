import type {ComponentPropsWithoutRef} from 'react'
import {cn} from '../ui/cn'

// The custom breakpoint matches the deprecated meetingTopBarMediaQuery (1280px)
const PhaseHeaderDescription = ({className, ...props}: ComponentPropsWithoutRef<'h2'>) => (
  <h2
    className={cn(
      'm-0 hidden font-normal text-fg-secondary min-[1280px]:mt-1 min-[1280px]:block min-[1280px]:text-[13px] min-[1280px]:leading-4',
      className
    )}
    {...props}
  />
)

export default PhaseHeaderDescription
