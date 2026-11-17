import type {SVGProps} from 'react'
import {cn} from '../cn'

const Checklist = ({className, ...props}: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox='0 0 24 24'
    aria-hidden='true'
    focusable='false'
    {...props}
    className={cn(
      'inline-block h-[1em] w-[1em] shrink-0 select-none fill-current text-[24px]',
      className
    )}
  >
    <path d='M22 7h-9v2h9zm0 8h-9v2h9zM5.54 11 2 7.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41zm0 8L2 15.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41z' />
  </svg>
)

export default Checklist
