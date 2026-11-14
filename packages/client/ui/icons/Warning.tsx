import type {SVGProps} from 'react'
import {cn} from '../cn'

const Warning = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z' />
  </svg>
)

export default Warning
